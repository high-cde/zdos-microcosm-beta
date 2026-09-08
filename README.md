# ZDOS Microcosm

ZDOS Microcosm è un’app mobile Expo/React Native offline-first, orientata ad Android e pensata come ambiente controllato per l’ecosistema ZDOS. L’esperienza include ZComm Videotel (Z-Videotex), un micro terminale esclusivamente Zlang in stile Termux, un terminale locale dimostrativo, un playground Zlang, un profilo Zchain read-only con configurazione Orbot, Node Pulse per heartbeat HTTPS, uno studio ZRetro, una Evidence Chain di sessione e una matrice Security basata su un profilo `DEFAULT-DENY`.

## Release 1.0.0

La release `v1.0.0` include **ZComm Videotel**, un sottosistema nativo concettuale con griglia CEPT 40×24, contratto `videotex.zlang`, navigazione `*Pagina#`, attestazione locale e canale Z-Modem/V.23 emulato senza socket. Include inoltre il **Zlang Micro Terminal**, le **Zlang Capsules**, le superfici **Zchain Zlang** read-only, **Node Pulse** e la configurazione EAS per APK Android installabile.

**APK Android:** [scarica la release stabile 1.0.0](https://github.com/high-cde/zdos-microcosm-beta/releases/download/v1.0.0/zdos-microcosm-1.0.0.apk)

**Documentazione ZComm:** [ZComm Z-Videotex](docs/zcomm-videotex.md)

**Microservizi attivi:** Node Status e ZComm Service Directory read-only, Evidence Chain append-only per utente e Zlang Contract Validator non esecutivo, esposti tramite API tRPC e mantenuti compatibili con il fallback locale.

## Microservizi Zlang

I servizi condividono il backend Express/tRPC e applicano una policy `DEFAULT-DENY`. Le procedure disponibili sono:

| API | Contratto Zlang | Accesso | Funzione |
|---|---|---|---|
| `node.status` | `status node.profile` | Pubblico, read-only | Stato e heartbeat del nodo `core-01` |
| `zcomm.catalog` | `status zcomm.catalog` | Pubblico, read-only | Catalogo delle pagine Videotel |
| `zcomm.page` | `read zcomm.page "*Pagina#"` | Pubblico, read-only | Lettura di una pagina allowlisted |
| `evidence.list` | `storage.read "evidence.recent"` | Utente autenticato | Lettura delle proprie ricevute |
| `evidence.append` | `storage.append "evidence.receipt"` | Utente autenticato | Scrittura append-only della propria ricevuta |
| `zlang.validate` | `validate profile` | Pubblico, non esecutivo | Validazione deterministica del sorgente |

Il validatore riconosce i profili `zdos.zlang.microterm.v1`, `zdos.videotex.native.v1` e `zdos.evidence.append.v1`. Non esiste un endpoint di esecuzione Zlang: ogni istruzione non presente nell’allowlist viene rifiutata.

### Database

La persistenza Evidence Chain richiede `DATABASE_URL` e la migrazione:

```bash
pnpm db:push
```

Senza database configurato, l’app mantiene il fallback locale e non perde la funzionalità di sessione.

## Limiti intenzionali

Il prodotto non è una shell Android general-purpose. Il micro terminale accetta esclusivamente il profilo Zlang e non esegue programmi o comandi reali. ZComm usa il catalogo HTTPS read-only quando disponibile e mantiene una griglia locale deterministica; non apre socket, non esegue bytecode arbitrario e usa soltanto pagine validate. L’app non accede liberamente al filesystem e non include compilatori nativi, emulatori o ROM retro. Zchain è read-only: signing e broadcast sono disabilitati. Orbot è solo un endpoint SOCKS5 configurabile e non viene avviato o controllato dall’app. Evidence Chain è append-only per utente: non espone cancellazione o aggiornamento delle ricevute.

## Stack

Il progetto usa Expo SDK 54, React Native 0.81, React 19, Expo Router 6, TypeScript 5.9, NativeWind 4 e Vitest 2.1.9. Il profilo `zdos.microcosm` riconosce esclusivamente il nodo pubblico reale `core-01`; il trasporto di controllo resta disabilitato e non viene consentita esecuzione remota. La firma `ZTRACE` è un fingerprint deterministico locale, informativo e non utilizzabile come segreto.

## Sviluppo locale

```bash
pnpm install
pnpm dev:metro
```

Il controllo TypeScript e i test sono eseguibili con:

```bash
pnpm check
pnpm vitest run --passWithNoTests
```

Il bundle JavaScript Android già esportato localmente si trova in `dist-android/` ed è stato prodotto con:

```bash
npx expo export --platform android --output-dir dist-android
```

La build APK production viene generata tramite EAS con il profilo `production`. L’APK stabile è disponibile nella [release GitHub v1.0.0](https://github.com/high-cde/zdos-microcosm-beta/releases/tag/v1.0.0). Le successive modifiche ai microservizi server-side richiedono una nuova build Android per essere incluse nel client.

## Struttura principale

| Percorso | Ruolo |
|---|---|
| `app/(tabs)/index.tsx` | Home Microcosm e superfici demo |
| `lib/zdos-demo.ts` | Contratti deterministici per terminale, Zlang, ZRetro, ricevute e ZTRACE |
| `lib/zdos-node.ts` | Metadati non-segreti del nodo pubblico reale |
| `lib/zcomm-videotex.ts` | Contratto ZComm Z-Videotex e navigazione `*Pagina#` |
| `zlang/videotex.zlang` | Specifica sorgente ZLB2 v2.5 del terminale Videotel |
| `docs/zcomm-videotex.md` | Specifica tecnica, sicurezza e navigazione ZComm |
| `lib/zcomm-service.ts` | Catalogo ZComm read-only e pagine `*Pagina#` |
| `server/routers.ts` | Router tRPC per `node.status` e `zcomm.catalog/page` |
| `zlang/evidence.zlang` | Contratto Zlang append/read-own dell’Evidence Chain |
| `lib/zlang-validator-service.ts` | Validatore Zlang deterministico e non esecutivo |
| `drizzle/0001_evidence_chain.sql` | Tabella persistente append-only delle ricevute |
| `docs/microservices-roadmap.md` | Analisi e roadmap dei microservizi Zlang |
| `tests/zdos-demo.test.ts` | Test unitari del comportamento demo |
| `app.config.ts` | Nome, slug, orientamento, package Android e branding |
| `assets/images/` | Icona, splash, favicon e foreground adaptive icon |
| `design.md` | Piano di interfaccia mobile |
| `todo.md` | Registro di funzionalità e limiti di prodotto |
| `profile.md` | Contratto del profilo e del binding al nodo pubblico |
| `dist-android/` | Export locale del bundle Expo per Android |
