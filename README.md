# ZDOS Microcosm Beta

ZDOS Microcosm Beta è un’app mobile Expo/React Native offline-first, orientata ad Android e pensata come laboratorio didattico per l’ecosistema ZDOS. L’esperienza include un terminale locale dimostrativo, un playground Zlang, uno studio ZRetro, una Evidence Chain di sessione e una matrice Security basata su un profilo `DEFAULT-DENY`.

## Limiti intenzionali

La beta non è una shell Android general-purpose. Non esegue programmi o comandi reali, non apre socket, non accede liberamente al filesystem, non usa account o backend remoti e non include compilatori nativi, emulatori o ROM retro. Le ricevute sono mantenute nello stato React della sessione e la loro persistenza locale è una possibile estensione futura.

## Stack

Il progetto usa Expo SDK 54, React Native 0.81, React 19, Expo Router 6, TypeScript 5.9, NativeWind 4 e Vitest 2.1.9. Il template contiene anche capacità server/database, ma questa beta resta locale e non richiede credenziali o servizi esterni. Il profilo `zdos.microcosm.beta` riconosce il nodo `vmi3082470.contaboserver.net` (`ZNODE-FF0A135D12F83F61`) come `IDENTIFIED / UNLINKED`: il trasporto resta `not-configured` e non viene consentita esecuzione remota. La firma `ZTRACE` è un fingerprint deterministico locale, informativo e non utilizzabile come segreto.

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
| `lib/zdos-node.ts` | Metadati non-segreti del nodo privato riconosciuto |
| `tests/zdos-demo.test.ts` | Test unitari del comportamento demo |
| `app.config.ts` | Nome, slug, orientamento, package Android e branding |
| `assets/images/` | Icona, splash, favicon e foreground adaptive icon |
| `design.md` | Piano di interfaccia mobile |
| `todo.md` | Registro di funzionalità e limiti beta |
| `profile.md` | Contratto del profilo e del binding al nodo privato |
| `dist-android/` | Export locale del bundle Expo per Android |
