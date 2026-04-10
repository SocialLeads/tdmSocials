import React, { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const sections = [
  {
    id: 'getting-started',
    title: 'Aan de slag',
    content: `
      <p>Welkom bij het TDM Socials beheerpaneel. Hiermee kun je:</p>
      <ul>
        <li>Klanten toevoegen en beheren</li>
        <li>Automatische dagelijkse content-idee e-mails versturen naar klanten</li>
        <li>PDF-facturen genereren en downloaden</li>
        <li>Handmatig e-mails opnieuw versturen als dat nodig is</li>
      </ul>

      <h4>Hoe het werkt</h4>
      <p>Elke klant die je toevoegt, ontvangt elke ochtend om <strong>08:00 uur</strong> automatisch een e-mail met social media content-ideeën. De ideeën worden gegenereerd op basis van de <strong>branche</strong> van de klant (bijv. Automotive, Restaurant, Fitness).</p>
      <p>Na het versturen ontvang je als admin een rapport op <strong>info@tdmsocials.nl</strong> met hoeveel e-mails succesvol zijn verstuurd en hoeveel er zijn mislukt.</p>

      <h4>Inloggen</h4>
      <ol>
        <li>Ga naar <strong>tdmsocials.nl/admin</strong></li>
        <li>Vul je e-mailadres en wachtwoord in</li>
        <li>Klik op <strong>Inloggen</strong></li>
      </ol>
      <p>Als je het verkeerde wachtwoord invoert, verschijnt er een foutmelding. Probeer het opnieuw of gebruik <em>Wachtwoord vergeten?</em> (zie sectie "Wachtwoord").</p>
    `,
  },
  {
    id: 'add-client',
    title: 'Klant toevoegen',
    content: `
      <h4>Stap voor stap</h4>
      <ol>
        <li>Klik op de knop <strong>+ Klant toevoegen</strong> rechtsboven op het dashboard.</li>
        <li>Er opent een venster met drie velden:</li>
      </ol>

      <h4>Velden invullen</h4>
      <ul>
        <li><strong>Bedrijfsnaam</strong> — De naam van het bedrijf van je klant. Voorbeeld: <em>Bakkerij De Gouden Krakeling</em></li>
        <li><strong>E-mail</strong> — Het e-mailadres waar de dagelijkse content-ideeën naartoe worden gestuurd. Dit moet een geldig e-mailadres zijn. Voorbeeld: <em>info@bakkerijdegoudenkrakeling.nl</em></li>
        <li><strong>Branche</strong> — Kies de branche die het beste bij het bedrijf past. Dit bepaalt welk soort content-ideeën er worden gegenereerd. Kies je bijvoorbeeld <em>Restaurant</em>, dan krijgt de klant ideeën over menu's, seizoensgerechten, achter-de-schermen content, etc.</li>
      </ul>

      <h4>Opslaan</h4>
      <ol>
        <li>Controleer of alle velden correct zijn ingevuld.</li>
        <li>Klik op <strong>Klant toevoegen</strong>.</li>
        <li>De klant verschijnt nu in de tabel op het dashboard.</li>
        <li>Vanaf de volgende ochtend om 08:00 ontvangt deze klant automatisch content-ideeën.</li>
      </ol>

      <h4>Foutmeldingen</h4>
      <ul>
        <li>Als het e-mailadres al in gebruik is, krijg je een foutmelding.</li>
        <li>Alle velden zijn verplicht — je kunt geen leeg formulier versturen.</li>
      </ul>
    `,
  },
  {
    id: 'edit-client',
    title: 'Klant bewerken',
    content: `
      <h4>Stap voor stap</h4>
      <ol>
        <li>Zoek de klant in de tabel op het dashboard. Je kunt de zoekbalk gebruiken om snel te filteren.</li>
        <li>Klik op de blauwe knop <strong>Bewerken</strong> rechts in de rij van de klant.</li>
        <li>Er opent een venster met de huidige gegevens van de klant.</li>
        <li>Pas de gewenste velden aan (naam, e-mail of branche).</li>
        <li>Klik op <strong>Wijzigingen opslaan</strong>.</li>
      </ol>

      <h4>Wat kun je wijzigen?</h4>
      <ul>
        <li><strong>Bedrijfsnaam</strong> — Als de naam van het bedrijf is veranderd.</li>
        <li><strong>E-mail</strong> — Als de klant de e-mails op een ander adres wil ontvangen. <strong>Let op:</strong> de dagelijkse e-mails gaan direct naar het nieuwe adres.</li>
        <li><strong>Branche</strong> — Als je de branche wilt wijzigen. De content-ideeën worden dan aangepast aan de nieuwe branche.</li>
      </ul>

      <h4>Annuleren</h4>
      <p>Wil je toch geen wijzigingen opslaan? Klik op <strong>Annuleren</strong>, druk op <strong>Esc</strong>, of klik buiten het venster. Er wordt dan niets gewijzigd.</p>
    `,
  },
  {
    id: 'delete-client',
    title: 'Klant verwijderen',
    content: `
      <h4>Stap voor stap</h4>
      <ol>
        <li>Zoek de klant in de tabel op het dashboard.</li>
        <li>Klik op de rode knop <strong>Verwijderen</strong> rechts in de rij.</li>
        <li>Er verschijnt een bevestigingsvraag: <em>"Weet je zeker dat je deze klant wilt verwijderen?"</em></li>
        <li>Klik op <strong>OK</strong> om te bevestigen, of <strong>Annuleren</strong> om te stoppen.</li>
      </ol>

      <h4>Wat gebeurt er?</h4>
      <ul>
        <li>De klant wordt <strong>permanent verwijderd</strong> uit het systeem.</li>
        <li>De klant ontvangt geen dagelijkse e-mails meer.</li>
        <li>Alle statistieken (totaal e-mails, sinds factuur) worden verwijderd.</li>
        <li><strong>Dit kan niet ongedaan worden gemaakt.</strong></li>
      </ul>
    `,
  },
  {
    id: 'search',
    title: 'Zoeken & filteren',
    content: `
      <p>Boven de klantentabel staat een zoekbalk. Hiermee kun je snel klanten vinden.</p>

      <h4>Hoe zoeken werkt</h4>
      <ul>
        <li>Typ een deel van de <strong>naam</strong>, <strong>e-mail</strong> of <strong>branche</strong> van de klant.</li>
        <li>De tabel filtert automatisch terwijl je typt — je hoeft niet op Enter te drukken.</li>
        <li>De zoekopdracht is <strong>niet hoofdlettergevoelig</strong> — "bakkerij" vindt ook "Bakkerij".</li>
      </ul>

      <h4>Voorbeelden</h4>
      <ul>
        <li>Typ <em>restaurant</em> om alle klanten in de branche Restaurant te zien.</li>
        <li>Typ <em>@gmail</em> om alle klanten met een Gmail-adres te vinden.</li>
        <li>Typ de eerste letters van een bedrijfsnaam om snel te filteren.</li>
      </ul>

      <p>Maak de zoekbalk leeg om weer alle klanten te tonen.</p>
    `,
  },
  {
    id: 'daily-emails',
    title: 'Dagelijkse e-mails',
    content: `
      <h4>Automatisch (dagelijks om 08:00)</h4>
      <p>Elke ochtend om <strong>08:00 uur</strong> worden automatisch content-idee e-mails verstuurd naar alle klanten in het systeem. Je hoeft hier niets voor te doen.</p>
      <p>Na afloop ontvang je een rapport per e-mail met:</p>
      <ul>
        <li>Hoeveel e-mails succesvol zijn verstuurd</li>
        <li>Hoeveel e-mails zijn mislukt (met details per klant)</li>
        <li>Welke branches zijn verwerkt</li>
        <li>Hoe lang het proces heeft geduurd</li>
      </ul>

      <h4>Handmatig versturen</h4>
      <p>Als de automatische verzending is mislukt, of als je wilt testen, kun je de e-mails handmatig versturen:</p>
      <ol>
        <li>Klik op <strong>Dagelijkse e-mails versturen</strong> rechtsboven op het dashboard.</li>
        <li>Er verschijnt een bevestigingsvenster met een waarschuwing.</li>
        <li>Klik op <strong>Ja, versturen</strong> om door te gaan.</li>
        <li>Wacht tot het proces is voltooid. Je ziet daarna een melding met het resultaat: <em>"Verzonden: X, Mislukt: Y"</em>.</li>
      </ol>

      <h4>Belangrijk</h4>
      <ul>
        <li>Handmatig versturen stuurt e-mails naar <strong>alle</strong> actieve klanten — niet naar een enkele klant.</li>
        <li>Gebruik dit alleen als de automatische verzending is mislukt, of in een testomgeving.</li>
        <li>De teller <em>Totaal e-mails</em> en <em>Sinds factuur</em> worden bijgewerkt na elke succesvolle verzending.</li>
      </ul>
    `,
  },
  {
    id: 'table-columns',
    title: 'Klantentabel uitleg',
    content: `
      <p>De tabel op het dashboard toont de volgende kolommen:</p>

      <h4>Naam</h4>
      <p>De bedrijfsnaam van de klant.</p>

      <h4>E-mail</h4>
      <p>Het e-mailadres waar de dagelijkse content-ideeën naartoe worden gestuurd.</p>

      <h4>Branche</h4>
      <p>De branche van het bedrijf. Dit wordt weergegeven als een gekleurd label. De branche bepaalt welk soort content-ideeën de klant ontvangt.</p>

      <h4>Totaal e-mails</h4>
      <p>Het totale aantal content-idee e-mails dat ooit naar deze klant is verstuurd. Dit telt alleen op en wordt nooit gereset.</p>

      <h4>Sinds factuur</h4>
      <p>Het aantal e-mails dat is verstuurd sinds de laatste factuur. Dit is belangrijk voor facturatie — zo weet je hoeveel e-mails je moet factureren. Deze teller wordt automatisch gereset naar 0 wanneer je een factuur genereert voor deze klant.</p>

      <h4>Laatste factuur</h4>
      <p>De datum waarop de laatste factuur is gegenereerd voor deze klant. Toont een streepje (-) als er nog geen factuur is aangemaakt.</p>

      <h4>Acties</h4>
      <p>Drie knoppen per klant:</p>
      <ul>
        <li><strong>Bewerken</strong> (blauw) — Klantgegevens wijzigen</li>
        <li><strong>Factuur</strong> (groen) — PDF-factuur genereren</li>
        <li><strong>Verwijderen</strong> (rood) — Klant permanent verwijderen</li>
      </ul>
    `,
  },
  {
    id: 'invoices',
    title: 'Facturen genereren',
    content: `
      <h4>Een factuur aanmaken</h4>
      <ol>
        <li>Klik op de groene knop <strong>Factuur</strong> bij de klant waarvoor je een factuur wilt maken.</li>
        <li>Er opent een venster met de factuurgegevens.</li>
      </ol>

      <h4>Factuurnummer</h4>
      <p>Het factuurnummer wordt automatisch ingevuld en opgehoogd bij elke nieuwe factuur:</p>
      <ul>
        <li>Eerste factuur: <strong>TDM-001</strong></li>
        <li>Tweede factuur: <strong>TDM-002</strong></li>
        <li>Enzovoort...</li>
      </ul>
      <p>Het nummer wordt onthouden in je browser. Je kunt het handmatig aanpassen als dat nodig is.</p>

      <h4>Regelitems invullen</h4>
      <p>De eerste regel wordt automatisch ingevuld:</p>
      <ul>
        <li><strong>Omschrijving</strong>: "Social media/marketing content"</li>
        <li><strong>Aantal</strong>: Het aantal e-mails sinds de laatste factuur</li>
        <li><strong>Stuksprijs</strong>: Moet je zelf invullen (bijv. 5.00 voor €5 per e-mail)</li>
        <li><strong>Totaal</strong>: Wordt automatisch berekend (Aantal × Stuksprijs)</li>
      </ul>

      <h4>Extra regelitems</h4>
      <ul>
        <li>Klik op <strong>+ Item toevoegen</strong> om een extra regel toe te voegen (bijv. voor leadgeneratie of andere diensten).</li>
        <li>Klik op het rode <strong>X</strong> om een regel te verwijderen. Er moet altijd minimaal 1 regel zijn.</li>
      </ul>

      <h4>BTW</h4>
      <ul>
        <li>De BTW staat standaard op <strong>21%</strong>.</li>
        <li>Je kunt het percentage aanpassen (bijv. 9% of 0%).</li>
        <li>Het BTW-bedrag en het totaal inclusief BTW worden automatisch berekend.</li>
      </ul>

      <h4>Totaaloverzicht</h4>
      <p>Rechtsonder zie je:</p>
      <ul>
        <li><strong>Subtotaal</strong> — De som van alle regelitems (exclusief BTW)</li>
        <li><strong>BTW</strong> — Het berekende BTW-bedrag</li>
        <li><strong>Totaal incl. BTW</strong> — Het eindbedrag dat de klant moet betalen</li>
      </ul>

      <h4>PDF downloaden</h4>
      <ol>
        <li>Controleer of alle gegevens kloppen.</li>
        <li>Klik op <strong>PDF genereren</strong>.</li>
        <li>De factuur wordt als PDF gedownload naar je computer.</li>
        <li>Het venster sluit automatisch.</li>
      </ol>

      <h4>Wat staat er op de factuur?</h4>
      <p>De PDF bevat automatisch:</p>
      <ul>
        <li>Bedrijfsgegevens: TDM Auto & Social Solutions, adres, KVK (98790595), BTW-id (NL005353984B34), IBAN (NL08 ABNA 0150 2705 85)</li>
        <li>Klantgegevens (naam en e-mail)</li>
        <li>Factuurdatum (vandaag) en vervaldatum (14 dagen later)</li>
        <li>Alle regelitems met bedragen</li>
        <li>Subtotaal, BTW en totaal</li>
        <li>Betalingsinstructies onderaan</li>
      </ul>

      <h4>Na het genereren</h4>
      <ul>
        <li>De teller <em>Sinds factuur</em> van de klant wordt automatisch gereset naar 0.</li>
        <li>De datum bij <em>Laatste factuur</em> wordt bijgewerkt naar vandaag.</li>
        <li>Het factuurnummer wordt onthouden voor de volgende factuur.</li>
      </ul>
    `,
  },
  {
    id: 'password',
    title: 'Wachtwoord',
    content: `
      <h4>Uitloggen</h4>
      <ol>
        <li>Klik op het gebruikersicoon rechtsboven in de navigatiebalk.</li>
        <li>Klik op <strong>Uitloggen</strong>.</li>
        <li>Je wordt teruggestuurd naar het inlogscherm.</li>
      </ol>

      <h4>Wachtwoord vergeten</h4>
      <ol>
        <li>Ga naar het inlogscherm (<strong>tdmsocials.nl/admin</strong>).</li>
        <li>Klik op <strong>Wachtwoord vergeten?</strong> onder het inlogformulier.</li>
        <li>Vul je e-mailadres in (het adres waarmee je bent geregistreerd).</li>
        <li>Klik op <strong>Resetlink versturen</strong>.</li>
        <li>Controleer je inbox (en je spam-map) voor een e-mail van TDM Socials.</li>
        <li>Klik op de blauwe knop <strong>Wachtwoord resetten</strong> in de e-mail.</li>
        <li>Je wordt doorgestuurd naar een pagina waar je een nieuw wachtwoord kunt instellen.</li>
        <li>Vul je nieuwe wachtwoord twee keer in en klik op <strong>Wachtwoord bijwerken</strong>.</li>
        <li>Je wordt automatisch teruggestuurd naar het inlogscherm.</li>
      </ol>

      <h4>Belangrijk</h4>
      <ul>
        <li>De resetlink is <strong>15 minuten</strong> geldig. Daarna moet je een nieuwe aanvragen.</li>
        <li>Je wachtwoord moet minimaal <strong>6 tekens</strong> bevatten.</li>
        <li>Als je geen e-mail ontvangt, controleer dan of je het juiste e-mailadres hebt ingevuld en kijk in je spam-map.</li>
      </ul>
    `,
  },
  {
    id: 'tips',
    title: 'Tips & veelgestelde vragen',
    content: `
      <h4>Ik zie geen klanten in de tabel</h4>
      <p>Als de tabel leeg is, heb je nog geen klanten toegevoegd. Klik op <strong>+ Klant toevoegen</strong> om te beginnen.</p>
      <p>Als je klanten hebt maar ze niet ziet, controleer dan of er tekst in de zoekbalk staat die de resultaten filtert. Maak de zoekbalk leeg om alle klanten te tonen.</p>

      <h4>De dagelijkse e-mails zijn niet verstuurd</h4>
      <p>Controleer je inbox voor het dagelijkse rapport. Als er een foutmelding in staat, kun je de e-mails handmatig opnieuw versturen via de knop op het dashboard. Als je helemaal geen rapport hebt ontvangen, neem dan contact op met de beheerder.</p>

      <h4>Ik kan niet inloggen</h4>
      <ul>
        <li>Controleer of je het juiste e-mailadres en wachtwoord gebruikt.</li>
        <li>Gebruik <em>Wachtwoord vergeten?</em> om een nieuw wachtwoord in te stellen.</li>
        <li>Als dat ook niet werkt, neem contact op met de beheerder.</li>
      </ul>

      <h4>De factuur-PDF wordt niet gedownload</h4>
      <ul>
        <li>Controleer of je browser pop-ups en downloads toestaat voor deze website.</li>
        <li>Probeer het opnieuw of gebruik een andere browser (Chrome of Firefox werkt het beste).</li>
      </ul>

      <h4>Kan ik een klant tijdelijk pauzeren?</h4>
      <p>Op dit moment is er geen pauzeerfunctie. Als je tijdelijk geen e-mails wilt versturen naar een klant, kun je de klant verwijderen en later opnieuw toevoegen. De statistieken (totaal e-mails, sinds factuur) gaan dan wel verloren.</p>

      <h4>In welke braches kan ik klanten indelen?</h4>
      <p>De beschikbare branches zijn: Automotive, Real Estate, Fitness, Restaurant, Beauty/Salon, Healthcare, Legal, Finance, Education, Technology, E-commerce, Construction, Photography, Travel, Pet Care, Cleaning Services, Landscaping, Dental, Chiropractic, HVAC, Plumbing, Electrical, Roofing, Insurance, Accounting, Marketing Agency, Wedding/Events, Food & Beverage, Fashion en Home Decor.</p>

      <h4>Contact</h4>
      <p>Voor technische problemen of vragen, stuur een e-mail naar <strong>info@tdmsocials.nl</strong>.</p>
    `,
  },
];

const HelpModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('getting-started');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const current = sections.find((s) => s.id === activeSection) || sections[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-[color:var(--c-bg)] rounded-xl shadow-xl w-full max-w-3xl h-[80vh] flex overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <nav className="w-52 flex-shrink-0 bg-[color:var(--c-bg2,#f9fafb)] border-r border-[color:var(--c-border)] p-4 overflow-y-auto">
          <h2 className="text-sm font-semibold text-[color:var(--c-text)] mb-3">Handleiding</h2>
          <ul className="space-y-1">
            {sections.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                    activeSection === s.id
                      ? 'bg-[color:var(--c-primary)] text-white font-medium'
                      : 'text-[color:var(--c-text2)] hover:bg-[color:var(--c-bg)] hover:text-[color:var(--c-text)]'
                  }`}
                >
                  {s.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[color:var(--c-border)]">
            <h3 className="text-lg font-semibold text-[color:var(--c-text)]">{current.title}</h3>
            <button
              onClick={onClose}
              className="text-[color:var(--c-text2)] hover:text-[color:var(--c-text)] text-xl leading-none"
            >
              &times;
            </button>
          </div>
          <div
            className="flex-1 overflow-y-auto px-6 py-4 text-sm text-[color:var(--c-text)] leading-relaxed help-content"
            dangerouslySetInnerHTML={{ __html: current.content }}
          />
        </div>
      </div>

      <style>{`
        .help-content p { margin-bottom: 12px; }
        .help-content ul, .help-content ol { margin-bottom: 12px; padding-left: 20px; }
        .help-content ul { list-style-type: disc; }
        .help-content ol { list-style-type: decimal; }
        .help-content li { margin-bottom: 6px; }
        .help-content h4 { font-weight: 600; margin: 16px 0 8px; font-size: 14px; }
        .help-content em { font-style: italic; color: var(--c-primary); }
        .help-content strong { font-weight: 600; }
      `}</style>
    </div>
  );
};

export default HelpModal;
