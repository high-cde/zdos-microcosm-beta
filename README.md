# ZDOS // MICROcosm

> **A controlled operating surface for ZDOS, Zlang and the next generation of local-first Web3 applications.**

[![CI](https://github.com/high-cde/zdos-microcosm-beta/actions/workflows/web-pages.yml/badge.svg)](https://github.com/high-cde/zdos-microcosm-beta/actions/workflows/web-pages.yml)
[![Android APK](https://github.com/high-cde/zdos-microcosm-beta/actions/workflows/android-apk.yml/badge.svg)](https://github.com/high-cde/zdos-microcosm-beta/actions/workflows/android-apk.yml)
[![Web](https://img.shields.io/badge/Web-GitHub%20Pages-0ea5e9)](https://high-cde.github.io/zdos-microcosm-beta/)
[![Security posture](https://img.shields.io/badge/posture-DEFAULT--DENY-16a34a)](#security-model)
[![Web3](https://img.shields.io/badge/Web3-read--only%20scaffold-8b5cf6)](#dsn-and-polygon-read-only)

**ZDOS // MICROcosm** è una webapp/mobile app Expo pensata come control plane osservabile per l’ecosistema ZDOS: superfici Zlang bounded, ZComm local-first, receipt verificabili, profili di capability, un Control Deck operativo e un percorso Web3 non-custodial per il token **$DSN**.

## Release 1.1.0 — Control Deck

La release aggiunge una superficie operativa raggiungibile dalla home con pulsanti reali e receipt locali:

- refresh dello stato locale;
- preparazione di un evolution draft senza pubblicazione;
- apertura diretta di ZComm;
- apertura della webapp `app.x-zdos.it/e`;
- apertura del repository GitHub;
- matrice Microcosm / Hybrid / DSN con stato esplicito;
- modalità Agent `DRAFT-ONLY`;
- DSN Polygon read-only e transazioni disabilitate.

Il Control Deck non finge uno stato live: il bridge verso `zdos-hybrid` resta `BRIDGE PENDING` finché non viene configurata un’API server-side autenticata.

Non è una shell general-purpose, non custodisce chiavi private e non presenta integrazioni blockchain non verificate come se fossero operative. Ogni capacità è dichiarata, limitata e osservabile.

## Live demo e artefatti

- **Webapp:** [high-cde.github.io/zdos-microcosm-beta](https://high-cde.github.io/zdos-microcosm-beta/)
- **Repository:** [github.com/high-cde/zdos-microcosm-beta](https://github.com/high-cde/zdos-microcosm-beta)
- **Build e deploy:** [GitHub Actions](https://github.com/high-cde/zdos-microcosm-beta/actions)
- **APK Android:** prodotto dal workflow `Android APK` come artifact di release; non vengono inserite chiavi private nell’app.

## Perché MICROcosm

Microcosm separa l’esperienza di un sistema operativo avanzato dalla superficie di rischio di un sistema general-purpose. L’app offre un ambiente piccolo, leggibile e componibile in cui:

- Zlang governa programmi allowlisted e validabili;
- ZComm mantiene una coda offline e sincronizza solo verso endpoint HTTPS espliciti;
- ZDOS registra receipt locali legate a un chain head deterministico;
- le capability non dichiarate vengono rifiutate;
- il wallet, quando verrà collegato, resta non-custodial e sotto il controllo dell’utente;
- il backend espone solo procedure tipizzate, non una shell remota.

Questa è la differenza tra una dashboard decorativa e un **control plane con postura**.

## Superfici ZDOS

| Superficie | Stato | Funzione |
|---|---|---|
| **01 — Terminale locale** | READY | Comandi demo bounded; nessun comando shell del sistema operativo. |
| **02 — Zlang Playground** | READY | Validazione del profilo ZLB2 v2.5 con esito `ACCEPTED` o `DENIED`. |
| **03 — ZRetro Studio** | VERIFIED | Preview contrattuale IR per esperimenti ZDOS. |
| **04 — Evidence Chain** | READY | Receipt di sessione e chain head locale verificabile. |
| **05 — Security** | DENIED by default | Capability visibili e azioni non autorizzate esplicitamente rifiutate. |
| **06 — ZDOS Profile** | DECLARATIVE | Identità, policy e binding descrittivo del nodo. |
| **07 — ZComm Videotel** | EXPERIMENTAL | Messaggistica 40×24 in Zlang, local-first, offline queue e sync HTTPS allowlisted. |
| **08 — DSN / Polygon** | READ-ONLY SCAFFOLD | Metadati pubblici del token $DSN; RPC live da configurare. |

## $DSN e Polygon — modalità read-only

Il token indicato per l’integrazione è:

```text
Name: NETkali
Symbol: DSN
Network: Polygon Mainnet
Chain ID: 137
Contract: 0xfc90516a1f736FaC557e09D8853dB80dA192c296
Decimals: 18
```

Il riferimento pubblico del contratto è disponibile su [PolygonScan](https://polygonscan.com/token/0xfc90516a1f736FaC557e09D8853dB80dA192c296).

La configurazione applicativa è intenzionalmente fail-closed:

```env
DSN_CHAIN_ID=137
DSN_ASSET_MODE=erc20
DSN_TOKEN_ADDRESS=0xfc90516a1f736FaC557e09D8853dB80dA192c296
DSN_TOKEN_DECIMALS=18
DSN_READ_ONLY=true
DSN_ALLOW_TRANSACTIONS=false
```

L’endpoint `DSN_RPC_URL` non è incluso nel repository e non viene inventato. Finché non viene configurato un RPC Polygon HTTPS verificato, l’app deve mostrare `RPC_PENDING` e non deve promettere saldo live, receipt on-chain o transazioni.

> **Principio:** un indirizzo di contratto pubblico non è una chiave privata e non autorizza alcuna operazione di spesa. Le transazioni, quando e se abilitate, dovranno essere firmate dal wallet dell’utente e protette da policy esplicite.

## Zlang e capability

Il profilo Zlang di Microcosm è un contratto applicativo, non un interprete di comandi arbitrari. Un programma deve appartenere alla superficie allowlisted e terminare con `halt`.

Esempio di profilo ZComm:

```zlang
zcomm.status
zcomm.page.list
zcomm.room.list
zcomm.message.queue
zcomm.sync status
zcomm.tx deny
halt
```

Le capability sono esposte come dati osservabili, per esempio:

```text
zcomm.page.read
zcomm.message.queue
zcomm.sync.push
```

Un input non riconosciuto restituisce `DENIED` senza aprire shell, socket generici, radio, credenziali o trasmissioni non autorizzate.

## Architettura

```text
Expo Router / React Native / Web
                │
                ├── Zlang bounded surfaces
                ├── ZComm local-first queue
                ├── ZDOS runtime + evidence receipts
                └── DSN read-only adapter (Polygon 137)
                │
        tRPC / Express backend
                │
        Drizzle ORM / MySQL
```

| Area | Responsabilità |
|---|---|
| `app/` | Home, superfici e layout Expo Router. |
| `components/` | Componenti UI riutilizzabili. |
| `lib/zdos-demo.ts` | Contratti demo, validator Zlang e receipt. |
| `lib/zdos-runtime.ts` | Boot, postura DEFAULT-DENY, persistenza e integrità locale. |
| `lib/zdos-zcomm.ts` | Profilo ZComm, stanze, coda offline e sync HTTPS. |
| `lib/zdos-node.ts` | Profilo dichiarativo del nodo ZDOS. |
| `server/` | Express, tRPC, OAuth e servizi infrastrutturali. |
| `drizzle/` | Schema e migrazioni MySQL. |
| `tests/` | Test dei contratti, runtime e autenticazione. |
| `.github/workflows/` | Pubblicazione Pages e build APK. |

## Security model

Microcosm usa una postura **DEFAULT-DENY**:

1. La capability deve essere dichiarata.
2. Il comando deve appartenere al profilo della superficie.
3. L’operazione produce un esito osservabile.
4. La receipt viene collegata alla catena locale.
5. La sincronizzazione remota è opt-in, HTTPS-only e retry-safe.
6. Nessuna chiave privata viene salvata nel repository o nel backend.
7. Nessuna transazione blockchain viene inviata nella configurazione attuale.

Le receipt locali sono integrity-linked, ma non devono essere descritte come firme crittografiche on-chain. Un eventuale ancoraggio su Polygon sarà una fase separata, con contratto, schema, gas policy e threat model documentati.

## Sviluppo locale

Requisiti consigliati:

- Node.js 22;
- pnpm 9.12;
- Java/Android SDK solo per build APK;
- variabili ambiente del template quando si utilizza il backend completo.

```bash
pnpm install
pnpm check
pnpm test -- --run
pnpm build
pnpm dev
```

Web export:

```bash
npx expo export --platform web --clear --output-dir dist
```

APK Android tramite GitHub Actions:

1. Aprire **Actions → Android APK**.
2. Avviare `Run workflow`.
3. Attendere `check`, test, Expo prebuild e Gradle release.
4. Scaricare l’artifact `zdos-microcosm-<sha>-release-apk`.

## Pubblicazione GitHub Pages

Il workflow `web-pages.yml`:

- installa dipendenze con lockfile congelato;
- esegue typecheck e test;
- genera l’export statico Expo Web;
- pubblica l’artefatto su GitHub Pages;
- si attiva su `main` oppure manualmente.

URL pubblico:

```text
https://high-cde.github.io/zdos-microcosm-beta/
```

## Roadmap trasparente

### Fase 1 — pubblicata

- UI Microcosm e superfici ZDOS;
- Zlang validator bounded;
- ZComm local-first;
- Evidence Chain locale;
- workflow Pages;
- workflow APK;
- DSN Polygon read-only scaffold.

### Fase 2 — integrazione Web3 controllata

- adapter RPC Polygon tramite `viem` o libreria equivalente;
- `eth_chainId`, `symbol`, `decimals` e `balanceOf` read-only;
- route tRPC tipizzate per stato chain e token;
- cache server-side senza custodire wallet;
- UI `RPC_PENDING` / `ONLINE` esplicita;
- test contro mock RPC e testnet prima di ogni transazione.

### Fase 3 — capability on-chain opzionali

- wallet connection non-custodial;
- firma esplicita nel wallet dell’utente;
- allowlist di contratti e funzioni;
- simulazione e stima gas;
- receipt on-chain e audit trail;
- kill switch e revoca capability.

## Riferimenti

- [ZDOS Microcosm — live webapp](https://high-cde.github.io/zdos-microcosm-beta/)
- [ZDOS Microcosm — repository](https://github.com/high-cde/zdos-microcosm-beta)
- [Token $DSN su PolygonScan](https://polygonscan.com/token/0xfc90516a1f736FaC557e09D8853dB80dA192c296)
- [Expo](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [tRPC](https://trpc.io/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Polygon](https://polygon.technology/)

## Licenza e collaborazione

Consultare [LICENSE](LICENSE) per i termini di utilizzo. Le integrazioni Web3 devono rispettare la licenza del progetto, la documentazione del contratto e le policy applicabili.

---

**ZDOS // MICROcosm** — *small surface, explicit capability, observable state.*
