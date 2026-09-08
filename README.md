# ZDOS // MICROcosm

> A small, controlled world for ZDOS experiments.

**ZDOS // MICROcosm** è un prodotto mobile/web pronto all’uso per esplorare superfici ZDOS locali, osservabili e limitate. L’app non presenta un sistema operativo general-purpose: propone invece un microcosmo controllato in cui ogni azione è bounded, receipt-linked e soggetta a un profilo **DEFAULT-DENY**.

![ZDOS Microcosm — home](docs/screenshots/microcosm-home.jpg)

## Stato attuale

| Indicatore | Valore |
|---|---|
| Release | Product Ready 1.0.0 |
| System posture | READY |
| Session | LOCAL |
| Network | DENIED by default; HTTPS sync optional |
| Storage | LOCAL PERSISTENT QUEUE |
| Superfici nel catalogo documentato | 11 (00–10) |
| Superfici implementate nel codice | 08, incluse ZComm Videotel e MECCANINCAME |
| Session receipts | Locali e receipt-linked |
| Esecuzione remota | Non configurata |
| Shell general-purpose | Non disponibile |

L’app è progettata per mantenere il perimetro locale e leggibile. Il profilo di default nega le capacità non dichiarate; non vengono eseguiti comandi shell arbitrari. Il trasporto online è disattivato per default e può essere usato solo con un endpoint HTTPS esplicito; il nodo privato mostrato nell’app resta un’identità descrittiva.

## Microcosm surfaces

La schermata principale presenta un catalogo di superfici locali. Ogni superficie ha un numero, una descrizione, uno stato e un accesso visuale dedicato.

| Superficie | Stato | Scopo |
|---|---|---|
| **00 — Zlang Micro Terminal** | READY | Terminale in stile Termux limitato al profilo Zlang by ZDOS. |
| **01 — Terminale locale** | READY | Comandi demo e stato del microcosmo locale. |
| **02 — Zlang Validator** | ACCEPTED / DENIED | Valida il profilo ZLB2 v2.5 senza compilatore nativo. |
| **03 — ZRetro Studio** | VERIFIED | Prepara una preview IR per il progetto Meteor Patrol. |
| **04 — Evidence Chain** | READY | Consulta le ricevute generate durante la sessione. |
| **05 — Security** | DENIED | Mostra le capability visibili con il profilo DEFAULT-DENY. |
| **06 — ZDOS Profile** | ROADMAP | Presenta identità, policy attiva e binding del nodo privato. |
| **07 — Node Pulse** | READY | Mostra un heartbeat pubblico read-only del nodo First Node core-01. |
| **08 — Zchain Zliang** | ROADMAP | Prevede la lettura blockchain read-only con profilo Orbot opzionale. |
| **09 — ZComm Videotel** | EXPERIMENTAL | Messaggeria 40×24 local-first in Zlang, con coda offline, antenna First Node e CB realtime `wss://` opzionale. |
| **10 — MECCANINCAME** | READY | Pairing locale in stile KDE Connect, implementato come profilo Zlang bounded; rete e shell negate. |

![ZDOS Microcosm — surfaces](docs/screenshots/microcosm-surfaces.jpg)

## Contratti locali della beta

La logica dimostrativa è concentrata in `lib/zdos-demo.ts` e definisce un insieme ridotto di contratti deterministici.

### Zlang Micro Terminal

Il terminale riconosce soltanto comandi appartenenti al profilo demo. Gli input sconosciuti vengono rifiutati con `DENIED`; non vengono passati a una shell del sistema operativo. Il comando `telecom` mantiene un alias compatibile e apre il riferimento al profilo ZComm Videotel.

Il catalogo corrente è:

```text
help   status   zlang
zretro telecom evidence deny
```

### Zlang Validator

Il validatore accetta sorgenti che iniziano con `emit ` e restituisce il profilo:

```text
ZLB2 v2.5 · emit · HALT
```

La sintassi non appartenente al profilo supportato viene respinta con `DENIED`.

### ZRetro Studio

La preview locale restituisce lo stato `VERIFIED` e il dettaglio `IR READY · manifest prepared`. Nella beta attuale questa è una preview contrattuale, non un compilatore o un generatore IR completo.

### ZComm Videotel

`ZComm Videotel` reinterpreta le messaggerie Videotel come una superficie comunitaria moderna. Il programma è scritto nel profilo locale Zlang `ZLB2 zcomm.local` e governa pagine CEPT 40×24, stanze, nickname e messaggi. I messaggi vengono persistiti sul dispositivo e marcati `PENDING` finché un endpoint HTTPS esplicitamente configurato non conferma la sincronizzazione.

Il template eseguibile è:

```zlang
zcomm.status
zcomm.page.list
zcomm.room.list
zcomm.message.queue
zcomm.sync status
zcomm.tx deny
halt
```

Il risultato atteso è `ACCEPTED`, con `screen: CEPT 40x24`, coda locale e `transmit: DENIED`. Il parser rifiuta shell, socket, radio, credenziali e comandi non allowlisted. `halt` è obbligatorio per chiudere il profilo. La sincronizzazione è best-effort, retry-safe e fail-closed: se la rete manca, la coda resta disponibile offline.

### MECCANINCAME

`MECCANINCAME` è una superficie locale ispirata al modello di pairing di KDE Connect, ma non implementa il protocollo KDE Connect né apre connessioni esterne. Il pairing è un record bounded nel profilo `zdos-meccanincame/v1`, con sole capability `device.status` e `pair.local`. Il contratto Zlang mostra esplicitamente `network: DENIED`, `shell: DENIED` e `transport: LOCAL_ONLY`; input shell, socket o capability non presenti vengono respinti.

La Home contiene inoltre il pulsante **X-ZDOS.IT**, che apre esclusivamente `https://x-zdos.it` tramite il browser di sistema. Questo è l’unico link web aggiunto da questa modifica; non viene usato come canale nascosto di pairing o controllo remoto.

### Evidence Chain e ZTRACE

Il runtime locale esegue un boot identificabile (`LOCAL-APP`), persiste le receipt su storage del dispositivo e conserva una catena verificabile con `chainHead`. `computeZtrace()` genera un fingerprint deterministico della superficie e del numero di receipt; il trace non è una firma crittografica, ma l’integrità dello stato viene verificata prima del salvataggio. Un archivio corrotto o manomesso viene rifiutato e ricreato con postura DEFAULT-DENY.

## Profilo e nodo privato

`lib/zdos-node.ts` contiene il profilo dichiarativo `zdos-node/v1` per il nodo privato associato alla beta. Il profilo espone soltanto le capacità:

```text
node.status
evidence.append
manifest.preview
```

Il nodo è marcato come `IDENTIFIED`, ma mantiene intenzionalmente i seguenti limiti:

```text
transport: not-configured
remoteExecution: false
networkExposure: false
posture: DEFAULT-DENY
```

Il repository non conserva password, token, chiavi SSH o credenziali operative del nodo.

## Architettura tecnica

Il progetto usa Expo Router per il routing, React Native/TypeScript per l’applicazione e NativeWind/Tailwind per lo stile. Il backend template include tRPC, autenticazione OAuth e Drizzle ORM con MySQL, ma il dominio ZDOS mostrato nella UI è ancora locale e non dipende da un servizio remoto.

| Directory | Responsabilità |
|---|---|
| `app/` | Schermate Expo Router, layout globale e callback OAuth. |
| `components/` | Componenti visuali riutilizzabili e tematizzati. |
| `lib/zdos-demo.ts` | Contratti locali per terminale, validazione, preview e receipt. |
| `lib/zdos-runtime.ts` | Runtime locale persistente: boot, posture DEFAULT-DENY, receipt e integrità della catena. |
| `lib/zdos-telecom.ts` | Interprete legacy bounded mantenuto per compatibilità del terminale. |
| `lib/zdos-zcomm.ts` | Runtime ZComm Videotel: profilo Zlang, stanze, coda offline, sync HTTPS e client CB realtime `wss://`. |
| `lib/zdos-meccanincame.ts` | Pairing locale bounded in stile KDE Connect, senza rete o shell. |
| `lib/zdos-node.ts` | Profilo descrittivo del nodo ZDOS. |
| `lib/trpc.ts` | Client tRPC e collegamento al backend. |
| `server/` | Router, autenticazione e servizi infrastrutturali. |
| `drizzle/` | Schema e migrazioni MySQL. |
| `tests/` | Test dei contratti demo, telecom e autenticazione. |
| `docs/screenshots/` | Screenshot di riferimento della UI. |

## Sicurezza e limiti intenzionali

Il progetto adotta un modello **local by design**. Il runtime ZDOS è attivo localmente, con boot identificabile, stato persistente e verifica dell’integrità della catena; la rete è negata nella postura predefinita, mentre i messaggi ZComm vengono salvati localmente in una coda persistente. Le capacità non dichiarate vengono negate. Questi limiti sono parte del comportamento previsto della beta, non errori di configurazione.

`ZComm Videotel` è una messaggeria testuale local-first: non sostituisce un modem, uno scanner RF, un client SIP, una radio o un sistema di monitoraggio di rete. Per abilitare il trasporto online impostare `EXPO_PUBLIC_ZCOMM_SYNC_URL` a un endpoint HTTPS sotto il proprio controllo; senza questa variabile l’app resta pienamente utilizzabile offline.

Le funzionalità indicate come `ROADMAP` sono segnali di direzione progettuale. Node Pulse e Zchain Zliang non sono integrazioni remote o blockchain operative. Il profilo locale `LOCAL-APP` è invece attivo e verificabile, ma non rappresenta ancora un nodo ZDOS remoto.

### Antenna ZComm verso First Node

ZComm può osservare il servizio VPS `zdos-first-node.service` come **antenna comunicativa read-only**. Configurare esplicitamente `EXPO_PUBLIC_ZDOS_FIRST_NODE_URL` con un endpoint HTTPS sotto il proprio controllo. Il pulsante dell’antenna esegue soltanto `GET <endpoint>/v1/status` e accetta il contratto JSON `zdos-node-status/v1` quando contiene `status: ONLINE`, `nodeId` e `nodeName`.

Un endpoint assente, non HTTPS, non raggiungibile o non verificabile produce `NOT_CONFIGURED`, `DENIED` o `OFFLINE`; in tutti i casi la coda locale resta disponibile. Il bridge non abilita shell remota, socket generici, filesystem remoto o esecuzione di comandi. L’invio dei messaggi resta separato e richiede l’endpoint HTTPS esplicito `EXPO_PUBLIC_ZCOMM_SYNC_URL`.

Per la versione web pubblicata su GitHub Pages e per l’APK Android, ZComm include anche un **CB realtime** tramite WebSocket sicuro. La variabile `EXPO_PUBLIC_ZCOMM_CB_WS_URL` deve contenere un relay `wss://` sotto il proprio controllo. Il client accetta soltanto frame JSON `zcomm.cb.message` con `roomId`, `nick`, `body` limitato a 240 caratteri e `createdAt`; URL `ws://`, frame malformati, shell e comandi arbitrari vengono negati. I workflow Pages e APK leggono la variabile GitHub Actions `ZCOMM_CB_WS_URL` e non contengono endpoint o segreti hard-coded.

Il runtime locale mantiene boot identificabile, stato persistente e verifica dell’integrità della catena. La persistenza non concede capability aggiuntive e non abilita trasporto remoto, shell o esecuzione arbitraria.

## Sviluppo locale

Requisiti consigliati:

- Node.js 22 o compatibile;
- pnpm;
- variabili d’ambiente del template, quando richieste dal backend o dall’autenticazione.

Installazione e avvio:

```bash
pnpm install
pnpm dev:metro
```

Per eseguire i test:

```bash
pnpm test -- --run
```

Per verificare i tipi TypeScript:

```bash
pnpm exec tsc --noEmit
```

Il controllo completo del repository può essere eseguito con:

```bash
pnpm check
pnpm lint
```

Il bundle JavaScript Android già esportato localmente si trova in `dist-android/` e può essere rigenerato con:

```bash
npx expo export --platform android --output-dir dist-android
```

La generazione di un APK nativo richiede un ambiente Android SDK/Gradle configurato; questo workspace contiene invece l’export Expo Android e non include una cartella nativa `android/`.

## Direzione del progetto

Le evoluzioni naturali del microcosmo sono un audit log server-side, capability grant/revoke espliciti, test end-to-end per OAuth, l’eventuale estensione della navigazione alle superfici roadmap e una definizione formale del modello di minaccia prima di ampliare il trasporto remoto. ZComm resta local-first: la sincronizzazione online non sostituisce la coda locale e non abilita shell, socket generici o trasmissioni radio.

Fino ad allora, ZDOS // MICROcosm resta ciò che dichiara di essere: **una piccola, controllata e osservabile area di esperimenti ZDOS**.

## Licenza

Consultare la licenza e le policy del repository per i termini di utilizzo del progetto.

## Riferimenti

- [Statuto completo ZDOS Microcosm, ZComm e First Node](docs/ZDOS_MICROCOSM_STATUTO.md)
- [Repository GitHub](https://github.com/high-cde/zdos-microcosm-beta)
- [Expo](https://expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [tRPC](https://trpc.io/)

## Pubblicazione

La versione web viene pubblicata automaticamente su GitHub Pages a ogni aggiornamento di `main`:

**https://high-cde.github.io/zdos-microcosm-beta/**

### Build Android APK

Il workflow `Android APK` esegue type-check, test, prebuild Expo e produce un APK release scaricabile dagli **Artifacts** della relativa GitHub Action. La build include il client CB, la coda offline e le policy Zlang default-deny. Per compilare l’APK già configurato verso il relay VPS, impostare nel repository la variabile Actions `ZCOMM_CB_WS_URL` con un URL `wss://`; senza variabile l’app resta offline-first e il pulsante CB mostra `DENIED`/`DISCONNECTED` senza tentare connessioni arbitrarie.

L’app mobile resta configurata per Expo Android/iOS. Il canale ufficiale della collaborazione è **[La Nova Avon su WhatsApp](https://whatsapp.com/channel/0029Vb7akVkKAwEp2NjB0U0x)**; il nome è cliccabile direttamente dalla Home.

## Licenza e utilizzo

Il progetto è distribuito con la **La Nova Avon — Creative Use License**. Sono consentiti l’uso personale, educativo e le creazioni originali autorizzate. Sono vietati copia, clonazione, fork, mirror, redistribuzione, rebranding, white-label, uso commerciale e distribuzione di derivati senza autorizzazione scritta. Consultare [LICENSE](LICENSE) per il testo completo.
