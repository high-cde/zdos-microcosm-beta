# ZDOS Microcosm Beta — Piano di design mobile

## Direzione

ZDOS Microcosm Beta è un laboratorio mobile offline-first per esplorare un microcosmo operativo dimostrativo: terminale locale, Zlang, ZRetro, ricevute di evidenza e capability in profilo default-deny. L’esperienza deve sembrare uno strumento tecnico didattico e controllato, non una shell Android general-purpose né un’estetica da hacker movie.

Il layout assume **portrait 9:16**, uso con una mano e interazioni verticali. Le superfici principali vivono in un’unica tab Home per mantenere il percorso corto; ogni superficie secondaria include sempre un’azione chiara per tornare al microcosmo.

## Schermate

### 1. Microcosm / Home

La Home presenta il brand `ZDOS // MICROcosm`, il badge `OFFLINE BETA`, il pannello `SYSTEM POSTURE / READY` e i marker di sicurezza `LOCAL`, `NETWORK DENIED` e `READ-ONLY`. Sotto l’header compare una griglia verticale di cinque accessi rapidi: Terminale, Zlang Playground, ZRetro Studio, Evidence Chain e Security. Ogni card mostra titolo, breve descrizione, stato e un accento cromatico distinto.

La parte bassa della Home contiene una nota di contesto: la beta non esegue shell reali e tutte le operazioni sono demo locali. Le card devono avere un’area di tocco ampia, feedback di pressione con riduzione dell’opacità e una gerarchia leggibile anche su schermi stretti.

### 2. Terminale locale

La schermata mostra un header compatto con pulsante `‹ Torna al microcosmo`, titolo `LOCAL TERMINAL` e stato `PREVIEW ONLY`. Il pannello principale è un terminale monospace scuro con prompt `x@microcosm:~$`, cronologia breve e output ad alto contrasto. In fondo al pannello compare un campo di testo con tastiera di tipo terminale e pulsante di invio.

I comandi supportati sono `help`, `status`, `zlang`, `zretro`, `evidence` e `deny`. Un comando sconosciuto riceve un rifiuto esplicito. Dopo ogni azione, la ricevuta generata è visibile come feedback sintetico sotto l’output, senza nascondere il prompt corrente.

### 3. Zlang Playground

L’header contiene il ritorno alla Home, il titolo `ZLANG PLAYGROUND` e il badge `ZLB2 v2.5`. Un editor multilinea monospace contiene inizialmente `emit ZDOS risponde`. Sotto l’editor sono mostrati i cinque elementi del contratto concettuale: `Magic`, `Version`, `Opcode`, `Length`, `HALT`.

Il CTA principale `VALIDATE ZLB2 v2.5` occupa una larghezza comoda per il pollice. Se il testo inizia con `emit `, il risultato è `ACCEPTED` con dettaglio `ZLB2 v2.5 · emit · HALT`; in caso contrario è `DENIED` con dettaglio `syntax outside supported profile`. La ricevuta appare subito sotto il risultato.

### 4. ZRetro Studio

La schermata include il titolo `ZRETRO STUDIO`, il badge `IR PREVIEW` e un editor multilinea con il manifest iniziale di Meteor Patrol:

```text
project Meteor Patrol
screen 320 200
scene courtyard
```

Il pulsante `PREVIEW METEOR PATROL` mostra il risultato `VERIFIED` e il dettaglio `IR READY · manifest prepared`. Una sezione target evidenzia `C64`, `Atari 8-bit` e `Amiga`; una nota separata chiarisce che emulatori e backend nativi sono `ROADMAP`, non funzionalità eseguibili nella beta.

### 5. Evidence Chain

La schermata mostra il titolo `EVIDENCE CHAIN`, un contatore delle ricevute nella sessione e una lista verticale di card. Ogni card contiene operazione, risultato, dettaglio e la firma testuale `local receipt · hash linked`. Gli stati usati sono `READY`, `VERIFIED`, `ACCEPTED`, `DENIED` e `ROADMAP`, con colori e icone coerenti.

La UI deve comunicare con chiarezza che la catena è dimostrativa e vive nello stato React della sessione: non va presentata come persistenza crittografica reale. La lista deve rimanere leggibile con molte ricevute e utilizzare una lista nativa efficiente quando necessario.

### 6. Security / Capabilities

La schermata mostra il profilo `DEFAULT-DENY PROFILE` e quattro righe di capability: `Network — DENIED`, `Storage — ./workspace only`, `Execution — PREVIEW ONLY`, `Identity — guest`. Un pannello introduttivo spiega che tutto ciò che non è espressamente previsto viene rifiutato o indicato come roadmap.

La schermata termina con una nota sui confini della beta: niente socket, shell Android, accesso libero al filesystem o rete automatica. Il tono deve restare informativo e rassicurante, con la sicurezza rappresentata come comportamento osservabile dell’interfaccia.

## Flussi chiave

### Avvio e orientamento

1. L’utente apre l’app e vede il pannello `SYSTEM POSTURE / READY`.
2. Legge i marker `LOCAL`, `NETWORK DENIED` e `READ-ONLY`.
3. Tocca una card della Home.
4. Entra nella superficie selezionata e può tornare con `‹ Torna al microcosmo`.

### Esecuzione di un comando demo

1. L’utente apre `Terminale`.
2. Tocca il campo prompt e inserisce un comando.
3. Preme invio o il pulsante di esecuzione.
4. L’app mostra l’output demo e aggiorna la cronologia.
5. L’app registra una ricevuta locale con risultato e dettaglio.
6. Per un comando non supportato, l’app mostra `DENIED` senza tentare esecuzioni reali.

### Validazione Zlang

1. L’utente apre `Zlang Playground`.
2. Modifica il codice nell’editor.
3. Tocca `VALIDATE ZLB2 v2.5`.
4. L’app verifica il profilo supportato `emit `.
5. Appare il risultato `ACCEPTED` o `DENIED` e viene registrata una ricevuta.

### Preview ZRetro

1. L’utente apre `ZRetro Studio`.
2. Modifica il manifest testuale se desidera.
3. Tocca `PREVIEW METEOR PATROL`.
4. L’app mostra `VERIFIED` e `IR READY · manifest prepared`.
5. La ricevuta è consultabile nella Evidence Chain.

### Ispezione della sicurezza

1. L’utente apre `Security` dalla Home.
2. Consulta le quattro capability.
3. Legge i limiti della beta.
4. Torna alla Home senza modificare permessi o configurazioni.

## Sistema visivo

| Token | Valore | Applicazione |
|---|---|---|
| `void` | `#070A0F` | Sfondo globale |
| `panel` | `#101820` | Card e superfici elevate |
| `cyan` | `#28E6F0` | Navigazione, bordi attivi e terminale |
| `lime` | `#B7FF2A` | CTA, READY, ACCEPTED e VERIFIED |
| `violet` | `#8B5CF6` | Metadati, Zlang e ZRetro |
| `amber` | `#F2C94C` | Roadmap e avvisi |
| `red` | `#FF5577` | Denied e rifiuti |
| `ink` | `#EAF2F4` | Testo primario |
| `muted` | `#8A9BA3` | Testo secondario |

Lo sfondo `void` deve occupare anche l’area sotto la status bar. Le card usano `panel`, bordi da 1 px con opacità moderata e piccoli indicatori colorati; evitare gradienti pesanti e ombre che riducano il contrasto. Il testo descrittivo resta in un sans-serif di sistema, mentre prompt, codice, output, badge e valori di stato usano una famiglia monospace.

## Componenti e comportamento

I pulsanti primari devono avere altezza minima di circa 48 px, raggio contenuto e feedback di pressione con scala lieve o opacità. Le azioni principali possono usare feedback aptico leggero sui dispositivi nativi, evitando l’uso ripetitivo. Gli editor devono avere `returnKeyType="done"` dove appropriato e mantenere il cursore facilmente raggiungibile sopra la tastiera.

Tutte le schermate usano il contenitore safe-area comune. Il contenuto scorre verticalmente, gli elementi critici non sono collocati negli angoli superiori e ogni vista secondaria ha un titolo sempre visibile. I messaggi di stato non dipendono soltanto dal colore: includono sempre una parola esplicita (`READY`, `ACCEPTED`, `DENIED` o `ROADMAP`).

## Confini intenzionali della beta

L’app non deve richiedere account, backend, cloud sync, rete, database remoto o autenticazione. Non deve lanciare programmi Android, eseguire shell reali, aprire socket, accedere liberamente al filesystem, eseguire binari retro, incorporare emulatori o fingere una Evidence Chain crittografica persistente. Le parti future devono essere etichettate `ROADMAP` e non devono apparire come azioni disponibili.
