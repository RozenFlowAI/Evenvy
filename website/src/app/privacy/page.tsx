'use client';

import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

export default function PrivacyPage() {
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
          Politica de Confidentialitate
        </h1>
        <p style={{ color: c.textTertiary, marginBottom: 32, fontSize: 14 }}>
          Ultima actualizare: 17 mai 2026 - Conforma GDPR (Regulamentul UE 2016/679)
        </p>

        <div style={sectionStyle}>
          <h2 style={h2Style}>1. Operatorul datelor</h2>
          <p style={pStyle}>
            Datele tale personale sunt prelucrate de:
          </p>
          <div style={{ color: c.textSecondary, lineHeight: 1.8 }}>
            <p><strong style={{ color: c.textPrimary }}>Operator:</strong> Vlad Trandafir (persoana fizica)</p>
            <p><strong style={{ color: c.textPrimary }}>Adresa de contact:</strong> contact@evenvy.ro</p>
            <p><strong style={{ color: c.textPrimary }}>Telefon:</strong> +40 731 177 299</p>
            <p><strong style={{ color: c.textPrimary }}>Pentru cereri GDPR:</strong> contact@evenvy.ro (subiect: "GDPR")</p>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>2. Ce date colectam</h2>
          <p style={pStyle}>Cand iti creezi cont si folosesti Platforma, colectam urmatoarele date:</p>
          <ul style={{ paddingLeft: 20 }}>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Date de identificare:</strong> nume, prenume, email, telefon (optional).</li>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Date de autentificare:</strong> parola criptata (nu o vedem niciodata in format necriptat).</li>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Date despre evenimente:</strong> tipul evenimentului, data, numarul de invitati, preferinte.</li>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Date despre locatii (proprietari):</strong> numele locatiei, adresa, descriere, poze, preturi, contact.</li>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Date tehnice:</strong> adresa IP, tipul browser-ului, sistem de operare, paginile vizitate.</li>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Cookies:</strong> vezi politica noastra de cookies separata.</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>3. De ce prelucram datele (scop si temei legal)</h2>
          <ul style={{ paddingLeft: 20 }}>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Furnizarea serviciului:</strong> pentru a iti permite sa cauti locatii, sa trimiti cereri si sa te conectezi cu proprietari. Temei: executarea contractului.</li>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Comunicare:</strong> pentru a iti raspunde la intrebari si a te notifica despre cererile tale. Temei: interes legitim.</li>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Imbunatatirea Platformei:</strong> pentru a analiza utilizarea si a o face mai buna. Temei: interes legitim.</li>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Marketing (doar cu acord):</strong> pentru a iti trimite oferte sau noutati. Temei: consimtamantul tau explicit, retractabil oricand.</li>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Respectarea legii:</strong> pentru a indeplini obligatii legale (de exemplu, raspundere la solicitari ale autoritatilor). Temei: obligatie legala.</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>4. Cu cine impartim datele tale</h2>
          <p style={pStyle}>Datele tale NU sunt vandute niciodata catre terti. Ele pot fi impartite doar cu:</p>
          <ul style={{ paddingLeft: 20 }}>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Proprietarii locatiilor:</strong> dupa ce trimiti o cerere de oferta, doar dupa ce proprietarul accepta cererea, acestia primesc datele tale de contact pentru a iti raspunde.</li>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Furnizorii nostri tehnici:</strong> Vercel (hosting site), Render (hosting backend), MongoDB Atlas (baza de date), Cloudinary (stocare poze), Google Search Console (analitice). Acestia respecta standardele GDPR.</li>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Autoritati publice:</strong> doar daca sunt cerute prin lege.</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>5. Cat timp pastram datele</h2>
          <ul style={{ paddingLeft: 20 }}>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Date de cont:</strong> cat timp contul este activ, plus 30 de zile dupa stergere.</li>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Date despre cereri de oferta:</strong> 2 ani de la trimitere, pentru evidenta si suport.</li>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Date tehnice (loguri):</strong> maxim 12 luni.</li>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Recenzii:</strong> permanent, dar pot fi anonimizate la cerere.</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>6. Drepturile tale GDPR</h2>
          <p style={pStyle}>In calitate de persoana vizata, ai urmatoarele drepturi:</p>
          <ul style={{ paddingLeft: 20 }}>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Dreptul de acces:</strong> sa stii ce date avem despre tine.</li>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Dreptul de rectificare:</strong> sa corectezi datele incorecte.</li>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Dreptul de stergere ("dreptul de a fi uitat"):</strong> sa ceri stergerea datelor.</li>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Dreptul de restrictionare:</strong> sa limitezi modul in care iti prelucram datele.</li>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Dreptul de portabilitate:</strong> sa primesti datele tale intr-un format structurat.</li>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Dreptul de opozitie:</strong> sa te opui prelucrarii pentru marketing direct.</li>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Dreptul de a-ti retrage consimtamantul:</strong> in orice moment, fara consecinte.</li>
            <li style={liStyle}><strong style={{ color: c.textPrimary }}>Dreptul de a depune plangere:</strong> la Autoritatea Nationala de Supraveghere a Prelucrarii Datelor cu Caracter Personal (ANSPDCP).</li>
          </ul>
          <p style={{ ...pStyle, marginTop: 16 }}>
            <strong style={{ color: c.textPrimary }}>Cum exerciti aceste drepturi:</strong> trimite un email la <strong style={{ color: c.textPrimary }}>contact@evenvy.ro</strong> cu subiectul "GDPR". Vom raspunde in maxim 30 de zile.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>7. Securitatea datelor</h2>
          <p style={pStyle}>
            Luam masuri tehnice si organizatorice pentru a iti proteja datele:
          </p>
          <ul style={{ paddingLeft: 20 }}>
            <li style={liStyle}>Conexiune criptata (HTTPS) pe toate paginile.</li>
            <li style={liStyle}>Parolele sunt criptate cu bcrypt si nu pot fi vazute in clar.</li>
            <li style={liStyle}>Acces restrictionat la baza de date.</li>
            <li style={liStyle}>Furnizorii nostri (Vercel, Render, MongoDB) respecta standardele GDPR si au certificari de securitate.</li>
          </ul>
          <p style={pStyle}>
            In cazul unei brese de securitate care iti afecteaza datele, vei fi notificat in maxim 72 de ore.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>8. Transfer international de date</h2>
          <p style={pStyle}>
            Unele dintre datele tale pot fi prelucrate de furnizorii nostri pe servere localizate in afara Spatiului Economic European (de exemplu, SUA). In aceste cazuri, transferul se face doar catre furnizori care respecta cadrul Privacy Shield, clauze contractuale standard sau alte garantii adecvate conform GDPR.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>9. Minori</h2>
          <p style={pStyle}>
            Platforma este destinata persoanelor de peste 18 ani. Nu colectam in mod constient date personale de la minori. Daca avem cunostinta ca am colectat astfel de date, le vom sterge imediat.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>10. Modificari ale politicii</h2>
          <p style={pStyle}>
            Putem actualiza aceasta politica. Modificarile importante vor fi notificate prin email sau printr-un mesaj vizibil pe Platforma.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>11. Contact</h2>
          <p style={pStyle}>
            Pentru orice intrebare legata de prelucrarea datelor tale personale, ne poti contacta la <strong style={{ color: c.textPrimary }}>contact@evenvy.ro</strong>.
          </p>
          <p style={pStyle}>
            Daca consideri ca drepturile tale au fost incalcate, poti depune plangere la:
          </p>
          <div style={{ color: c.textSecondary, lineHeight: 1.7 }}>
            <p><strong style={{ color: c.textPrimary }}>ANSPDCP</strong> (Autoritatea Nationala de Supraveghere a Prelucrarii Datelor cu Caracter Personal)</p>
            <p>B-dul G-ral. Gheorghe Magheru 28-30, Sector 1, Bucuresti</p>
            <p>Telefon: +40.318.059.211</p>
            <p>Website: <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer" style={{ color: c.primary }}>www.dataprotection.ro</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
