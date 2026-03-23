from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import jwt
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_SECRET = "lumina-event-venue-secret-key-2024"
JWT_ALGORITHM = "HS256"
security = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

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
    city: str
    address: str = ""
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

class VenueUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
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

# ─── Auth Helpers ───

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, role: str) -> str:
    return jwt.encode({"user_id": user_id, "role": role}, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0, "password": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_optional_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return await db.users.find_one({"id": payload["user_id"]}, {"_id": 0, "password": 0})
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
    return {
        "token": token,
        "user": {"id": user_id, "name": user["name"], "first_name": data.first_name, "last_name": data.last_name, "email": data.email, "phone": data.phone, "role": data.role}
    }

@api_router.post("/auth/login")
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Credențiale invalide")
    token = create_token(user["id"], user["role"])
    return {
        "token": token,
        "user": {"id": user["id"], "name": user["name"], "first_name": user.get("first_name", ""), "last_name": user.get("last_name", ""), "email": user["email"], "phone": user.get("phone", ""), "role": user["role"]}
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
    sort_by: Optional[str] = "newest"
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

    sort_field = "created_at"
    sort_dir = -1
    if sort_by == "price_asc":
        sort_field = "price_per_person"
        sort_dir = 1
    elif sort_by == "price_desc":
        sort_field = "price_per_person"
        sort_dir = -1
    elif sort_by == "rating":
        sort_field = "avg_rating"
        sort_dir = -1
    elif sort_by == "capacity":
        sort_field = "capacity_max"
        sort_dir = -1

    venues = await db.venues.find(query, {"_id": 0}).sort(sort_field, sort_dir).to_list(100)
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

# ─── Quote Request Routes (Cere ofertă) ───

@api_router.post("/quotes")
async def request_quote(data: QuoteRequest, user=Depends(get_current_user)):
    venue = await db.venues.find_one({"id": data.venue_id}, {"_id": 0})
    if not venue:
        raise HTTPException(status_code=404, detail="Locația nu a fost găsită")
    quote_id = str(uuid.uuid4())
    quote = {
        "id": quote_id,
        "client_id": user["id"],
        "client_name": user["name"],
        "client_email": user["email"],
        "client_phone": data.client_phone or user.get("phone", ""),
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
    await db.quotes.update_one({"id": quote_id}, {"$set": {"status": status}})
    return {"message": f"Cerere actualizată: {status}"}

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
    return {
        "total_venues": len(my_venues),
        "total_quotes": total_quotes,
        "pending_quotes": pending,
        "responded_quotes": responded
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
        ]
    }

# ─── Health ───

@api_router.get("/health")
async def health():
    return {"status": "ok"}

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
    # Drop old seeded data
    await db.venues.delete_many({})
    await db.reviews.delete_many({})
    await db.users.delete_many({})
    await db.quotes.delete_many({})
    await db.bookings.delete_many({})
    await db.status_checks.delete_many({})

    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.venues.create_index("id", unique=True)
    await db.venues.create_index("owner_id")
    await db.venues.create_index("status")
    await db.venues.create_index([("city", 1), ("event_types", 1)])
    await db.quotes.create_index("id", unique=True)
    await db.quotes.create_index("client_id")
    await db.quotes.create_index("venue_id")
    await db.reviews.create_index("venue_id")
    logger.info("Lumina Event Venue Marketplace API started")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
