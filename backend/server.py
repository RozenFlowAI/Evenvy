from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query, File, UploadFile
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import shutil
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Evenvy - Marketplace Locații Evenimente")
api_router = APIRouter(prefix="/api")

JWT_SECRET = os.environ.get("JWT_SECRET", "change-this-in-production")
JWT_ALGORITHM = "HS256"
security = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ─── Loyalty Tiers Configuration ───
LOYALTY_TIERS = {
    "bronze": {"name": "Bronze", "min_requests": 0, "discount": 0, "color": "#CD7F32"},
    "argint": {"name": "Argint", "min_requests": 3, "discount": 5, "color": "#C0C0C0"},
    "aur": {"name": "Aur", "min_requests": 10, "discount": 10, "color": "#FFD700"},
    "platina": {"name": "Platină", "min_requests": 25, "discount": 15, "color": "#E5E4E2"},
}

# ─── Commission Tiers for Visibility ───
COMMISSION_TIERS = {
    "standard": {"rate": 10, "boost": 0, "badge": None},
    "premium": {"rate": 15, "boost": 50, "badge": "Recomandat"},
    "elite": {"rate": 20, "boost": 100, "badge": "Top Alegere"},
}

# ─── Promotion Packages ───
PROMOTION_PACKAGES = {
    "bronze": {"name": "Pachet Bronze", "days": 7, "price": 49, "boost": 30, "badge": None},
    "silver": {"name": "Pachet Silver", "days": 14, "price": 89, "boost": 60, "badge": "Promovat"},
    "gold": {"name": "Pachet Gold", "days": 30, "price": 149, "boost": 100, "badge": "Top Promovat", "homepage_banner": True},
}

# ─── Models ───

class UserRegister(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    phone: str = ""
    role: str = "client"  # "client" or "owner"

class UserLogin(BaseModel):
    email: str
    password: str

class VenueCreate(BaseModel):
    name: str
    description: str
    rules: str = ""  # Venue rules section
    city: str
    address: str = ""
    latitude: Optional[float] = None  # GPS coordinates
    longitude: Optional[float] = None
    price_per_person: Optional[float] = None
    price_type: str = "on_request"  # "fixed" or "on_request"
    capacity_min: int = 10
    capacity_max: int = 100
    event_types: List[str] = []
    style_tags: List[str] = []
    amenities: List[str] = []
    images: List[str] = []
    contact_phone: str = ""
    contact_email: str = ""
    contact_person: str = ""
    commission_tier: str = "standard"  # "standard", "premium", "elite"

class VenueUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    rules: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_per_person: Optional[float] = None
    price_type: Optional[str] = None
    capacity_min: Optional[int] = None
    capacity_max: Optional[int] = None
    event_types: Optional[List[str]] = None
    style_tags: Optional[List[str]] = None
    amenities: Optional[List[str]] = None
    images: Optional[List[str]] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    contact_person: Optional[str] = None
    commission_tier: Optional[str] = None

class QuoteRequest(BaseModel):
    venue_id: str
    event_type: str
    event_date: str
    guest_count: int
    message: str = ""
    client_phone: str = ""

class ReviewCreate(BaseModel):
    venue_id: str
    rating: int
    comment: str

class PromotionPurchase(BaseModel):
    venue_id: str
    package: str  # "bronze", "silver", "gold"

# ─── Auth Helpers ───

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, role: str) -> str:
    return jwt.encode({"user_id": user_id, "role": role}, JWT_SECRET, algorithm=JWT_ALGORITHM)

def get_loyalty_tier(request_count: int) -> dict:
    """Calculate user's loyalty tier based on completed requests"""
    tier_id = "bronze"
    for tid, config in LOYALTY_TIERS.items():
        if request_count >= config["min_requests"]:
            tier_id = tid
    return {"id": tier_id, **LOYALTY_TIERS[tier_id]}

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0, "password": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        # Calculate loyalty tier
        request_count = await db.quotes.count_documents({"client_id": user["id"]})
        user["loyalty_tier"] = get_loyalty_tier(request_count)
        user["total_requests"] = request_count
        return user
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_optional_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0, "password": 0})
        if user:
            request_count = await db.quotes.count_documents({"client_id": user["id"]})
            user["loyalty_tier"] = get_loyalty_tier(request_count)
            user["total_requests"] = request_count
        return user
    except Exception:
        return None

# ─── Auth Routes ───

@api_router.post("/auth/register")
async def register(data: UserRegister):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email deja înregistrat")
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "first_name": data.first_name,
        "last_name": data.last_name,
        "name": f"{data.first_name} {data.last_name}",
        "email": data.email,
        "phone": data.phone,
        "password": hash_password(data.password),
        "role": data.role,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    token = create_token(user_id, data.role)
    loyalty_tier = get_loyalty_tier(0)
    return {
        "token": token,
        "user": {
            "id": user_id, "name": user["name"], "first_name": data.first_name, 
            "last_name": data.last_name, "email": data.email, "phone": data.phone, 
            "role": data.role, "loyalty_tier": loyalty_tier, "total_requests": 0
        }
    }

@api_router.post("/auth/login")
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Credențiale invalide")
    token = create_token(user["id"], user["role"])
    request_count = await db.quotes.count_documents({"client_id": user["id"]})
    loyalty_tier = get_loyalty_tier(request_count)
    return {
        "token": token,
        "user": {
            "id": user["id"], "name": user["name"], "first_name": user.get("first_name", ""), 
            "last_name": user.get("last_name", ""), "email": user["email"], 
            "phone": user.get("phone", ""), "role": user["role"],
            "loyalty_tier": loyalty_tier, "total_requests": request_count
        }
    }

@api_router.get("/auth/me")
async def get_me(user=Depends(get_current_user)):
    return user

# ─── Venue Routes ───

@api_router.get("/venues")
async def list_venues(
    search: Optional[str] = None,
    event_type: Optional[str] = None,
    city: Optional[str] = None,
    price_max: Optional[float] = None,
    capacity_min: Optional[int] = None,
    style: Optional[str] = None,
    sort_by: Optional[str] = "recommended"
):
    query = {"status": "active"}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"city": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    if event_type:
        query["event_types"] = {"$in": [event_type]}
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    if price_max is not None:
        query["price_per_person"] = {"$lte": price_max, "$gt": 0}
    if capacity_min is not None:
        query["capacity_max"] = {"$gte": capacity_min}
    if style:
        query["style_tags"] = {"$in": [style]}

    venues = await db.venues.find(query, {"_id": 0}).to_list(200)
    
    # Calculate visibility score for each venue
    now = datetime.now(timezone.utc)
    for venue in venues:
        score = 0
        # Commission tier boost
        tier = venue.get("commission_tier", "standard")
        score += COMMISSION_TIERS.get(tier, {}).get("boost", 0)
        
        # Active promotion boost
        promo = venue.get("active_promotion")
        if promo and promo.get("expires_at"):
            exp = datetime.fromisoformat(promo["expires_at"].replace("Z", "+00:00"))
            if exp > now:
                score += promo.get("boost", 0)
                venue["promotion_badge"] = promo.get("badge")
            else:
                venue["active_promotion"] = None
        
        # Commission badge
        comm_badge = COMMISSION_TIERS.get(tier, {}).get("badge")
        if comm_badge and not venue.get("promotion_badge"):
            venue["commission_badge"] = comm_badge
        
        venue["visibility_score"] = score
    
    # Sort venues
    if sort_by == "recommended":
        venues.sort(key=lambda v: (-v.get("visibility_score", 0), -v.get("avg_rating", 0), v.get("created_at", "")), reverse=False)
        venues.sort(key=lambda v: v.get("visibility_score", 0), reverse=True)
    elif sort_by == "price_asc":
        venues.sort(key=lambda v: v.get("price_per_person") or 99999)
    elif sort_by == "price_desc":
        venues.sort(key=lambda v: v.get("price_per_person") or 0, reverse=True)
    elif sort_by == "rating":
        venues.sort(key=lambda v: v.get("avg_rating", 0), reverse=True)
    elif sort_by == "capacity":
        venues.sort(key=lambda v: v.get("capacity_max", 0), reverse=True)
    elif sort_by == "newest":
        venues.sort(key=lambda v: v.get("created_at", ""), reverse=True)
    
    return venues

@api_router.get("/venues/promoted")
async def get_promoted_venues():
    """Get venues with active gold promotions for homepage banner"""
    now = datetime.now(timezone.utc).isoformat()
    venues = await db.venues.find({
        "status": "active",
        "active_promotion.package": "gold",
        "active_promotion.expires_at": {"$gt": now}
    }, {"_id": 0}).to_list(10)
    return venues

@api_router.get("/venues/owner/mine")
async def my_venues(user=Depends(get_current_user)):
    if user["role"] != "owner":
        raise HTTPException(status_code=403, detail="Doar proprietarii au acces")
    venues = await db.venues.find({"owner_id": user["id"]}, {"_id": 0}).to_list(100)
    return venues

@api_router.get("/venues/{venue_id}")
async def get_venue(venue_id: str):
    venue = await db.venues.find_one({"id": venue_id}, {"_id": 0})
    if not venue:
        raise HTTPException(status_code=404, detail="Locația nu a fost găsită")
    return venue

@api_router.post("/venues")
async def create_venue(data: VenueCreate, user=Depends(get_current_user)):
    if user["role"] != "owner":
        raise HTTPException(status_code=403, detail="Doar proprietarii pot adăuga locații")
    venue_id = str(uuid.uuid4())
    venue = {
        "id": venue_id,
        "owner_id": user["id"],
        "owner_name": user["name"],
        **data.model_dump(),
        "status": "active",
        "avg_rating": 0,
        "review_count": 0,
        "quote_count": 0,
        "view_count": 0,
        "active_promotion": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.venues.insert_one(venue)
    venue.pop("_id", None)
    return venue

@api_router.put("/venues/{venue_id}")
async def update_venue(venue_id: str, data: VenueUpdate, user=Depends(get_current_user)):
    venue = await db.venues.find_one({"id": venue_id})
    if not venue:
        raise HTTPException(status_code=404, detail="Locația nu a fost găsită")
    if venue["owner_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Nu ești proprietarul acestei locații")
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if update_data:
        await db.venues.update_one({"id": venue_id}, {"$set": update_data})
    updated = await db.venues.find_one({"id": venue_id}, {"_id": 0})
    return updated

@api_router.delete("/venues/{venue_id}")
async def delete_venue(venue_id: str, user=Depends(get_current_user)):
    venue = await db.venues.find_one({"id": venue_id})
    if not venue:
        raise HTTPException(status_code=404, detail="Locația nu a fost găsită")
    if venue["owner_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Nu ești proprietarul")
    await db.venues.delete_one({"id": venue_id})
    return {"message": "Locația a fost ștearsă"}

# ─── Promotion Routes ───

@api_router.post("/venues/{venue_id}/promote")
async def purchase_promotion(venue_id: str, data: PromotionPurchase, user=Depends(get_current_user)):
    """Purchase a promotion package for a venue"""
    venue = await db.venues.find_one({"id": venue_id})
    if not venue:
        raise HTTPException(status_code=404, detail="Locația nu a fost găsită")
    if venue["owner_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Nu ești proprietarul acestei locații")
    
    package = PROMOTION_PACKAGES.get(data.package)
    if not package:
        raise HTTPException(status_code=400, detail="Pachet invalid")
    
    # Calculate expiration
    expires_at = datetime.now(timezone.utc) + timedelta(days=package["days"])
    
    promotion = {
        "package": data.package,
        "name": package["name"],
        "boost": package["boost"],
        "badge": package.get("badge"),
        "homepage_banner": package.get("homepage_banner", False),
        "purchased_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": expires_at.isoformat()
    }
    
    await db.venues.update_one({"id": venue_id}, {"$set": {"active_promotion": promotion}})
    
    # Log promotion purchase
    await db.promotion_purchases.insert_one({
        "id": str(uuid.uuid4()),
        "venue_id": venue_id,
        "owner_id": user["id"],
        "package": data.package,
        "price": package["price"],
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": f"Promovare {package['name']} activată pentru {package['days']} zile", "promotion": promotion}

@api_router.get("/promotions/packages")
async def get_promotion_packages():
    """Get available promotion packages"""
    return PROMOTION_PACKAGES

# ─── Quote Request Routes (Cere ofertă) ───

@api_router.post("/quotes")
async def request_quote(data: QuoteRequest, user=Depends(get_current_user)):
    venue = await db.venues.find_one({"id": data.venue_id}, {"_id": 0})
    if not venue:
        raise HTTPException(status_code=404, detail="Locația nu a fost găsită")
    
    # Get user's loyalty tier for potential discount
    request_count = await db.quotes.count_documents({"client_id": user["id"]})
    loyalty_tier = get_loyalty_tier(request_count)
    
    quote_id = str(uuid.uuid4())
    quote = {
        "id": quote_id,
        "client_id": user["id"],
        "client_name": user["name"],
        "client_email": user["email"],
        "client_phone": data.client_phone or user.get("phone", ""),
        "client_loyalty_tier": loyalty_tier["id"],
        "client_discount": loyalty_tier["discount"],
        "venue_id": data.venue_id,
        "venue_name": venue["name"],
        "venue_image": venue["images"][0] if venue.get("images") else "",
        "venue_city": venue["city"],
        "owner_id": venue["owner_id"],
        "event_type": data.event_type,
        "event_date": data.event_date,
        "guest_count": data.guest_count,
        "message": data.message,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.quotes.insert_one(quote)
    await db.venues.update_one({"id": data.venue_id}, {"$inc": {"quote_count": 1}})
    quote.pop("_id", None)
    return quote

@api_router.get("/quotes/mine")
async def my_quotes(user=Depends(get_current_user)):
    quotes = await db.quotes.find({"client_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return quotes

@api_router.get("/quotes/owner")
async def owner_quotes(user=Depends(get_current_user)):
    if user["role"] != "owner":
        raise HTTPException(status_code=403, detail="Doar proprietarii")
    my_venues = await db.venues.find({"owner_id": user["id"]}, {"id": 1, "_id": 0}).to_list(100)
    venue_ids = [v["id"] for v in my_venues]
    quotes = await db.quotes.find({"venue_id": {"$in": venue_ids}}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return quotes

@api_router.put("/quotes/{quote_id}/status")
async def update_quote_status(quote_id: str, status: str, user=Depends(get_current_user)):
    quote = await db.quotes.find_one({"id": quote_id})
    if not quote:
        raise HTTPException(status_code=404, detail="Cererea nu a fost găsită")
    if quote["owner_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Nu ești autorizat")
    if status not in ["responded", "rejected", "pending"]:
        raise HTTPException(status_code=400, detail="Status invalid")
    await db.quotes.update_one({"id": quote_id}, {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}})
    return {"message": f"Cerere actualizată: {status}"}

# ANTI-BYPASS: Check if user has sent a quote for this venue
@api_router.get("/quotes/check/{venue_id}")
async def check_user_quote(venue_id: str, user=Depends(get_current_user)):
    """Check if the current user has sent a quote request for this venue"""
    quote = await db.quotes.find_one({"venue_id": venue_id, "client_id": user["id"]})
    return {"has_quote": quote is not None, "quote_id": quote["id"] if quote else None}

# ─── Review Routes ───

@api_router.post("/reviews")
async def create_review(data: ReviewCreate, user=Depends(get_current_user)):
    venue = await db.venues.find_one({"id": data.venue_id})
    if not venue:
        raise HTTPException(status_code=404, detail="Locația nu a fost găsită")
    existing = await db.reviews.find_one({"venue_id": data.venue_id, "user_id": user["id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Ai lăsat deja o recenzie")
    review_id = str(uuid.uuid4())
    review = {
        "id": review_id,
        "venue_id": data.venue_id,
        "user_id": user["id"],
        "user_name": user["name"],
        "rating": min(max(data.rating, 1), 5),
        "comment": data.comment,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.reviews.insert_one(review)
    all_reviews = await db.reviews.find({"venue_id": data.venue_id}, {"_id": 0, "rating": 1}).to_list(1000)
    avg = sum(r["rating"] for r in all_reviews) / len(all_reviews)
    await db.venues.update_one({"id": data.venue_id}, {"$set": {"avg_rating": round(avg, 1), "review_count": len(all_reviews)}})
    review.pop("_id", None)
    return review

@api_router.get("/reviews/venue/{venue_id}")
async def venue_reviews(venue_id: str):
    reviews = await db.reviews.find({"venue_id": venue_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return reviews

# ─── Owner Stats ───

@api_router.get("/stats/owner")
async def owner_stats(user=Depends(get_current_user)):
    if user["role"] != "owner":
        raise HTTPException(status_code=403, detail="Doar proprietarii")
    my_venues = await db.venues.find({"owner_id": user["id"]}, {"_id": 0}).to_list(100)
    venue_ids = [v["id"] for v in my_venues]
    total_quotes = await db.quotes.count_documents({"venue_id": {"$in": venue_ids}})
    pending = await db.quotes.count_documents({"venue_id": {"$in": venue_ids}, "status": "pending"})
    responded = await db.quotes.count_documents({"venue_id": {"$in": venue_ids}, "status": "responded"})
    total_views = sum(v.get("view_count", 0) for v in my_venues)
    return {
        "total_venues": len(my_venues),
        "total_quotes": total_quotes,
        "pending_quotes": pending,
        "responded_quotes": responded,
        "total_views": total_views
    }

# ─── Loyalty Program Info ───

@api_router.get("/loyalty/tiers")
async def get_loyalty_tiers():
    """Get all loyalty tier information"""
    return LOYALTY_TIERS

@api_router.get("/loyalty/my-progress")
async def my_loyalty_progress(user=Depends(get_current_user)):
    """Get user's loyalty progress"""
    request_count = await db.quotes.count_documents({"client_id": user["id"]})
    current_tier = get_loyalty_tier(request_count)
    
    # Find next tier
    next_tier = None
    for tid, config in LOYALTY_TIERS.items():
        if config["min_requests"] > request_count:
            next_tier = {"id": tid, **config}
            break
    
    return {
        "current_tier": current_tier,
        "total_requests": request_count,
        "next_tier": next_tier,
        "requests_to_next": next_tier["min_requests"] - request_count if next_tier else 0
    }

# ─── Config / Enums ───

@api_router.get("/config")
async def get_config():
    return {
        "event_types": [
            {"id": "wedding", "label": "Nuntă", "icon": "heart"},
            {"id": "baptism", "label": "Botez", "icon": "water"},
            {"id": "corporate", "label": "Corporate", "icon": "briefcase"},
            {"id": "civil_wedding", "label": "Cununie Civilă", "icon": "ribbon"},
            {"id": "party", "label": "Petrecere", "icon": "musical-notes"},
            {"id": "birthday", "label": "Aniversare", "icon": "gift"},
            {"id": "conference", "label": "Conferință", "icon": "people"},
        ],
        "style_tags": [
            "Modern", "Glamour", "Rustic", "Exclusivist",
            "Natură", "Panoramic", "Istoric", "Central", "Pe plajă"
        ],
        "cities": [
            "București", "Cluj-Napoca", "Timișoara", "Iași",
            "Brașov", "Constanța", "Sibiu", "Oradea", "Craiova"
        ],
        "amenities": [
            "Parcare", "Catering inclus", "DJ / Muzică live", "Decorațiuni",
            "Fotograf / Videograf", "Bar", "Terasă", "Grădină", "Piscină",
            "Scenă", "Echipament AV", "WiFi", "Climatizare", "Cameră mirilor",
            "Acces persoane cu dizabilități"
        ],
        "loyalty_tiers": LOYALTY_TIERS,
        "commission_tiers": COMMISSION_TIERS,
        "promotion_packages": PROMOTION_PACKAGES,
    }

# ─── Health ───

@api_router.get("/health")
async def health():
    return {"status": "ok", "app": "Evenvy Marketplace"}

# ─── File Upload ───

# Create uploads directory
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

@api_router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    user = Depends(get_optional_user)
):
    """Upload an image file and return the URL"""
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only images are allowed.")
    
    # Generate unique filename
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"{uuid.uuid4()}.{ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return the URL (relative path that will be served)
    url = f"/api/uploads/{unique_filename}"
    return {"url": url, "filename": unique_filename}

# Serve uploaded files
@api_router.get("/uploads/{filename}")
async def get_uploaded_file(filename: str):
    """Serve uploaded files"""
    from fastapi.responses import FileResponse
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.venues.create_index("id", unique=True)
    await db.venues.create_index("owner_id")
    await db.venues.create_index("status")
    await db.venues.create_index([("city", 1), ("event_types", 1)])
    await db.venues.create_index("commission_tier")
    await db.quotes.create_index("id", unique=True)
    await db.quotes.create_index("client_id")
    await db.quotes.create_index("venue_id")
    await db.reviews.create_index("venue_id")
    await db.promotion_purchases.create_index("venue_id")
    logger.info("Evenvy Event Venue Marketplace API started")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
