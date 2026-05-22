'use client';

import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

export default function TermsPage() {
  const { theme } = useTheme();
  const c = theme.colors;

  const sectionStyle = {
    background: c.surface,
    border: `1px solid ${c.border}`,
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
  };
  const h2Style = { fontSize: 20, fontWeight: 600, color: c.textPrimary, marginBottom: 12 };
  const pStyle = { color: c.textSecondary, lineHeight: 1.7, marginBottom: 12 };
  const liStyle = { color: c.textSecondary, lineHeight: 1.7, marginBottom: 8 };

  return (
    <div style={{ minHeight: '100vh', padding: '48px 16px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Link href="/" style={{ color: c.textSecondary, textDecoration: 'none', fontSize: 14, marginBottom: 16, display: 'inline-block' }}>
          Inapoi la pagina principala
        </Link>

        <h1 style={{ fontSize: 36, fontWeight: 700, color: c.textPrimary, marginBottom: 8 }}>
          Termeni si Conditii
        </h1>
        <p style={{ color: c.textTertiary, marginBottom: 32, fontSize: 14 }}>
          Ultima actualizare: 17 mai 2026
        </p>

        <div style={sectionStyle}>
          <h2 style={h2Style}>1. Despre acesti termeni</h2>
          <p style={pStyle}>
            Prin accesarea si utilizarea platformei Evenvy (evenvy.ro), accepti acesti Termeni si Conditii. Daca nu esti de acord cu vreuna dintre prevederi, te rugam sa nu utilizezi platforma.
          </p>
          <p style={pStyle}>
            <strong style={{ color: c.textPrimary }}>Operatorul platformei:</strong> Vlad Trandafir, persoana fizica, cu adresa de contact: contact@evenvy.ro.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>2. Definitii</h2>
          <ul style={{ paddingLeft: 20 }}>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Platforma:</strong> website-ul evenvy.ro si serviciile oferite prin acesta.</li>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Utilizator:</strong> orice persoana care acceseaza Platforma.</li>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Client:</strong> Utilizator inregistrat care cauta locatii pentru evenimente.</li>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Proprietar:</strong> Utilizator inregistrat care listeaza locatii pe Platforma.</li>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Locatie:</strong> spatiul (sala, restaurant, conac etc.) listat pe Platforma.</li>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Cerere de oferta:</strong> mesaj trimis de Client unui Proprietar pentru a primi pret personalizat.</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>3. Inregistrare si cont</h2>
          <p style={pStyle}>
            Pentru a utiliza anumite functionalitati, este necesara crearea unui cont. Te obligi sa furnizezi informatii reale, complete si actualizate.
          </p>
          <p style={pStyle}>
            Esti responsabil pentru pastrarea confidentialitatii parolei si pentru toate activitatile desfasurate prin contul tau. Anunta-ne imediat orice utilizare neautorizata.
          </p>
          <p style={pStyle}>
            Trebuie sa ai cel putin 18 ani pentru a crea un cont.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>4. Rolul Evenvy</h2>
          <p style={pStyle}>
            Evenvy este o platforma intermediara care faciliteaza intalnirea dintre Clienti si Proprietari de locatii. <strong style={{ color: c.textPrimary }}>Evenvy nu este parte a contractelor incheiate</strong> intre Clienti si Proprietari.
          </p>
          <p style={pStyle}>
            Detaliile evenimentelor, preturile, conditiile de rezervare, calitatea serviciilor si orice alt aspect operational sunt convenite direct intre Client si Proprietar.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>5. Obligatiile Proprietarilor</h2>
          <p style={pStyle}>Proprietarii care listeaza locatii pe Evenvy se obliga:</p>
          <ul style={{ paddingLeft: 20 }}>
            <li style={liStyle}>Sa furnizeze informatii reale, complete si actualizate despre locatie.</li>
            <li style={liStyle}>Sa raspunda cererilor de oferta intr-un timp rezonabil.</li>
            <li style={liStyle}>Sa respecte angajamentele asumate fata de Clienti.</li>
            <li style={liStyle}>Sa nu utilizeze datele de contact ale Clientilor in scopuri de marketing fara acordul lor explicit.</li>
            <li style={liStyle}>Sa nu listeze locatii pe care nu le detin sau pentru care nu au drept de comercializare.</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>6. Obligatiile Clientilor</h2>
          <p style={pStyle}>Clientii care utilizeaza Evenvy se obliga:</p>
          <ul style={{ paddingLeft: 20 }}>
            <li style={liStyle}>Sa trimita cereri de oferta cu intentia reala de a inchiria o locatie.</li>
            <li style={liStyle}>Sa nu trimita cereri abuzive, repetate sau cu informatii false.</li>
            <li style={liStyle}>Sa respecte angajamentele asumate fata de Proprietari.</li>
            <li style={liStyle}>Sa lase recenzii sincere, bazate pe experienta reala.</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>7. Continut interzis</h2>
          <p style={pStyle}>Pe Platforma sunt interzise:</p>
          <ul style={{ paddingLeft: 20 }}>
            <li style={liStyle}>Continut ilegal, ofensator, discriminatoriu sau care promoveaza violenta.</li>
            <li style={liStyle}>Informatii false sau inselatoare despre locatii.</li>
            <li style={liStyle}>Recenzii false (pozitive sau negative).</li>
            <li style={liStyle}>Spam, mesaje comerciale nesolicitate.</li>
            <li style={liStyle}>Materiale care incalca drepturi de autor, marca inregistrata sau alte drepturi de proprietate intelectuala.</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>8. Avertismente si sanctiuni</h2>
          <p style={pStyle}>
            Evenvy isi rezerva dreptul de a emite avertismente, suspenda sau elimina conturile Utilizatorilor care incalca acesti Termeni.
          </p>
          <p style={pStyle}>
            Sanctiunile pot include:
          </p>
          <ul style={{ paddingLeft: 20 }}>
            <li style={liStyle}>Avertisment scris pentru prima abatere.</li>
            <li style={liStyle}>Suspendare temporara a contului (1-30 zile) pentru abateri repetate.</li>
            <li style={liStyle}>Eliminare permanenta a contului pentru abateri grave sau recidiva.</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>9. Preturi si plati</h2>
          <p style={pStyle}>
            Utilizarea platformei este <strong style={{ color: c.textPrimary }}>gratuita</strong> pentru Clienti.
          </p>
          <p style={pStyle}>
            Pentru Proprietari, listarea locatiilor este gratuita in primele 6 luni de la inregistrare. Dupa aceasta perioada, Evenvy poate introduce planuri tarifare optionale care vor fi comunicate cu cel putin 30 de zile inainte.
          </p>
          <p style={pStyle}>
            Tranzactiile financiare intre Client si Proprietar (avansuri, plati pentru servicii) se desfasoara direct intre acestia, in afara Platformei.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>10. Limitarea raspunderii</h2>
          <p style={pStyle}>
            Evenvy nu garanteaza disponibilitatea continua a Platformei si poate suspenda accesul pentru mentenanta sau actualizari.
          </p>
          <p style={pStyle}>
            Evenvy nu este responsabila pentru:
          </p>
          <ul style={{ paddingLeft: 20 }}>
            <li style={liStyle}>Calitatea serviciilor oferite de Proprietari.</li>
            <li style={liStyle}>Anularea, modificarea sau nerespectarea conditiilor de catre Proprietari sau Clienti.</li>
            <li style={liStyle}>Continutul recenziilor postate de Utilizatori.</li>
            <li style={liStyle}>Pagube indirecte sau pierderi de profit rezultate din utilizarea Platformei.</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>11. Proprietate intelectuala</h2>
          <p style={pStyle}>
            Toate elementele Platformei (design, logo, texte, cod) sunt proprietatea Evenvy si sunt protejate de legile privind drepturile de autor. Utilizarea neautorizata este interzisa.
          </p>
          <p style={pStyle}>
            Continutul incarcat de Utilizatori (descrieri, poze, recenzii) ramane proprietatea acestora, dar prin postarea pe Platforma acorda Evenvy o licenta gratuita de utilizare in scopul functionarii Platformei.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>12. Modificari ale termenilor</h2>
          <p style={pStyle}>
            Evenvy poate modifica acesti Termeni in orice moment. Modificarile vor fi publicate pe aceasta pagina cu o noua data de actualizare. Continuarea utilizarii Platformei dupa modificari constituie acceptarea acestora.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>13. Solutionarea litigiilor</h2>
          <p style={pStyle}>
            Orice litigiu rezultat din utilizarea Platformei se va solutiona amiabil. In caz contrar, competenta apartine instantelor judecatoresti din Romania, in conformitate cu legislatia romana.
          </p>
          <p style={pStyle}>
            Pentru consumatori, exista posibilitatea solutionarii alternative prin platforma SOL a Comisiei Europene: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: c.primary }}>ec.europa.eu/consumers/odr</a>
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>14. Contact</h2>
          <p style={pStyle}>
            Pentru intrebari privind acesti Termeni, contacteaza-ne la <strong style={{ color: c.textPrimary }}>contact@evenvy.ro</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
