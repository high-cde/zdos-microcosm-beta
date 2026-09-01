# ZDOS Microcosm v1.0.0-beta.2

**Stato:** prerelease tecnica  
**Menu:** `ZDOS` e `Zlang` soltanto  
**Modalità:** offline, read-only, default-deny

## Contenuto

Questa release contiene la home minima Microcosm con due card progetto, profili locali, palette cyan/lime/violet e micro-immagini ASCII. Non usa immagini esterne per le card e non attiva rete, shell o backend.

## Package

| File | Descrizione |
|---|---|
| `zdos-microcosm-android-export.zip` | Export Expo Android con bundle JavaScript e metadata |
| `SHA256SUMS` | Checksum SHA-256 del package |
| `source code` | Sorgenti della beta e documentazione |

Il package è un **export Android Expo**, non un APK nativo firmato. Un APK installabile richiede una build EAS/Android separata con application ID, version code, signing e test su dispositivo reale.

## Verifiche

```bash
pnpm check
pnpm vitest run --passWithNoTests
npx expo export --platform android --output-dir dist-android-minimal
```

La pipeline CI `android-beta` esegue gli stessi controlli su pull request e push su `main`.

## Limiti

La beta non esegue kernel ZDOS, compiler Zlang, shell Android, processi nativi, socket, sincronizzazioni, accesso libero al filesystem o operazioni remote. `VERIFIED` nelle card indica soltanto il profilo catalogato del progetto e non un test runtime eseguito dal telefono.
