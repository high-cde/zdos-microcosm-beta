# ZDOS Microcosm

ZDOS Microcosm è un’app mobile Expo/React Native offline-first, orientata ad Android e pensata come ambiente controllato per l’ecosistema ZDOS. L’esperienza include ZComm Videotel (Z-Videotex), un micro terminale esclusivamente Zlang in stile Termux, un terminale locale dimostrativo, un playground Zlang, un profilo Zchain read-only con configurazione Orbot, Node Pulse per heartbeat HTTPS, uno studio ZRetro, una Evidence Chain di sessione e una matrice Security basata su un profilo `DEFAULT-DENY`.

## Release 1.0.0

La release `v1.0.0` include **ZComm Videotel**, un sottosistema nativo concettuale con griglia CEPT 40×24, contratto `videotex.zlang`, navigazione `*Pagina#`, attestazione locale e canale Z-Modem/V.23 emulato senza socket. Include inoltre il **Zlang Micro Terminal**, le **Zlang Capsules**, le superfici **Zchain Zlang** read-only, **Node Pulse** e la configurazione EAS per APK Android installabile.

**APK Android:** [scarica la release stabile 1.0.0](https://github.com/high-cde/zdos-microcosm-beta/releases/download/v1.0.0/zdos-microcosm-1.0.0.apk)

**Documentazione ZComm:** [ZComm Z-Videotex](docs/zcomm-videotex.md)

**Microservizi attivi:** Node Status e ZComm Service Directory read-only, esposti tramite API tRPC e mantenuti compatibili con il fallback locale.

## Limiti intenzionali

Il prodotto non è una shell Android general-purpose. Il micro terminale accetta esclusivamente il profilo Zlang e non esegue programmi o comandi reali. ZComm valida solo il contratto Videotel e rende una griglia fissa locale; non apre socket, non esegue bytecode arbitrario e non contatta server. L’app non accede liberamente al filesystem, non usa account o backend remoti e non include compilatori nativi, emulatori o ROM retro. Zchain è read-only: signing e broadcast sono disabilitati. Orbot è solo un endpoint SOCKS5 configurabile e non viene avviato o controllato dall’app. Le ricevute sono mantenute nello stato React della sessione e la loro persistenza locale è una possibile estensione futura.

## Stack

Il progetto usa Expo SDK 54, React Native 0.81, React 19, Expo Router 6, TypeScript 5.9, NativeWind 4 e Vitest 2.1.9. Il template contiene anche capacità server/database, ma questa release resta locale e non richiede credenziali o servizi esterni. Il profilo `zdos.microcosm` riconosce esclusivamente il nodo pubblico reale `core-01`; il trasporto resta `not-configured` e non viene consentita esecuzione remota. La firma `ZTRACE` è un fingerprint deterministico locale, informativo e non utilizzabile come segreto.

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

La generazione di un APK nativo richiede un ambiente Android SDK/Gradle configurato; questo workspace contiene invece l’export Expo Android verificato e non include una cartella nativa `android/`.

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
| `docs/microservices-roadmap.md` | Analisi e roadmap dei microservizi Zlang |
| `tests/zdos-demo.test.ts` | Test unitari del comportamento demo |
| `app.config.ts` | Nome, slug, orientamento, package Android e branding |
| `assets/images/` | Icona, splash, favicon e foreground adaptive icon |
| `design.md` | Piano di interfaccia mobile |
| `todo.md` | Registro di funzionalità e limiti di prodotto |
| `profile.md` | Contratto del profilo e del binding al nodo pubblico |
| `dist-android/` | Export locale del bundle Expo per Android |
