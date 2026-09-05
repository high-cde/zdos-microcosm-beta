# 🧪 ZDOS Microcosm Beta

**ZDOS Microcosm Beta** è una piccola app Expo/React Native offline-first che presenta un menu minimo con i soli progetti ufficiali **ZDOS** e **Zlang**.

🔗 **Punto di ingresso dell’ecosistema:** [x-zdos.it](https://x-zdos.it/)  
🧩 **Connessioni canoniche:** soltanto repository e superfici ufficiali ZDOS, elencati in [`docs/CONNECTIONS.md`](docs/CONNECTIONS.md).

> Questa beta è una console informativa locale. Non è una shell Android, non esegue comandi reali e non attiva collegamenti remoti.

## Stato attuale

| Area | Stato |
|---|---|
| Menu principale | Due sole voci: ZDOS e Zlang |
| Interazione | Card apribili, profilo locale richiudibile |
| Visual design | Palette dark cyan/lime/violet e micro-immagini ASCII |
| Rete | Negata nella beta |
| Esecuzione | Preview informativa, nessuna shell o processo nativo |
| Persistenza | Stato locale della schermata; nessun backend |
| Android | APK release nativo locale compilato; prerelease beta da pubblicare su GitHub |

## 🔭 Funzioni

La card **ZDOS** mostra il profilo del kernel/distro, il target x86_64, il percorso build/QEMU e il riferimento alla Evidence Chain. La card **Zlang** mostra il profilo compiler/VM, il contratto ZLB2 v2.5 e il fatto che la validazione nella beta è soltanto locale e informativa. L’apertura di un progetto aggiunge un’evidenza alla **ZChain locale**, verificata con SHA-256 e senza valore monetario.

Le micro-immagini visualizzate nelle card sono stringhe ASCII colorate renderizzate con font monospace. Non vengono scaricate immagini esterne e non vengono aggiunti asset grafici per il menu.

## 🛠️ Avvio locale

```bash
pnpm install
pnpm dev:metro
```

Per eseguire il controllo statico e i test:

```bash
pnpm check
pnpm vitest run --passWithNoTests
```

Per generare l’export Android Expo:

```bash
npx expo export --platform android --output-dir dist-android-minimal
```

L’export produce il bundle JavaScript e i metadata Android. **Non produce da solo un file APK installabile e firmato**; per quello serve una build Android/EAS con keystore e configurazione di distribuzione.

## 🗂️ Struttura essenziale

| Percorso | Ruolo |
|---|---|
| `app/(tabs)/index.tsx` | Home minima, menu ZDOS/Zlang e profili locali |
| `components/screen-container.tsx` | Safe area comune |
| `app.config.ts` | Nome, slug, package Android e branding Expo |
| `assets/images/` | Icona e splash dell’app; non usati come micro-immagini del menu |
| `tests/zdos-demo.test.ts` | Test dei contratti demo ereditati |
| `design.md` | Specifica visiva aggiornata |
| `profile.md` | Confini di sicurezza e profilo locale |
| `todo.md` | Checklist beta e gap residui |
| `lib/zchain.ts` | Genesis, evidence append e verifica hash-linked offline |
| `tests/zchain.test.ts` | Test di integrità e anti-manomissione ZChain |
| `android/` | Progetto Android nativo generato per la build release |

## 🔒 Confini di sicurezza

La beta usa un modello `DEFAULT-DENY`: nessun socket, nessuna shell Android, nessun accesso libero al filesystem, nessun compilatore nativo, nessuna ROM/emulatore e nessuna sincronizzazione automatica con ZDOS Lab o con un nodo remoto. I riferimenti a ZDOS e Zlang sono profili informativi, non dichiarazioni di esecuzione sul dispositivo.

## 📦 APK nativa beta

La build nativa locale è stata compilata con Gradle. La prerelease GitHub includerà l’APK, il checksum SHA-256, il progetto Android e le note in [`docs/RELEASE_V1.0.0-BETA.3.md`](docs/RELEASE_V1.0.0-BETA.3.md). L’APK non è firmato con un keystore di produzione e non è una release di store.

Per l’installazione locale:

```bash
adb install -r zdos-microcosm-beta-release.apk
```

La ZChain inclusa è un ledger di evidenza locale: non è una blockchain pubblica e non implementa token, mining, wallet, pagamenti o consenso multi-nodo.

## 🔗 Connessioni univoche

Microcosm usa una allowlist documentale chiusa. I soli riferimenti pubblici ammessi sono l’ecosistema ZDOS e [x-zdos.it](https://x-zdos.it/). Nella beta minima questi collegamenti sono **read-only e documentali**: l’app non effettua chiamate di rete, non sincronizza dati e non importa codice remoto.

| Superficie | Link canonico | Ruolo |
|---|---|---|
| ZDOS | [GitHub / high-cde/ZDOS](https://github.com/high-cde/ZDOS) | Kernel, distro e prove x86_64 |
| Zlang | [GitHub / high-cde/Zlang](https://github.com/high-cde/Zlang) | Linguaggio, VM e contratto ZLB2 |
| ZDOS Lab | [GitHub / high-cde/ZDOS-lab-v1](https://github.com/high-cde/ZDOS-lab-v1) | Catalogo, contratti e package |
| SEC Portal | [GitHub / high-cde/ZDOS-SEC-PORTAL](https://github.com/high-cde/ZDOS-SEC-PORTAL) | HUD e ledger locale sperimentale |
| Z-CYBERCORE | [GitHub / high-cde/Z-CYBERCORE](https://github.com/high-cde/Z-CYBERCORE) | Security demo autorizzata |
| ZDOS Organism | [GitHub / high-cde/zdos-organism](https://github.com/high-cde/zdos-organism) | Runtime sperimentale |
| Webapp | [x-zdos.it](https://x-zdos.it/) | Punto di ingresso pubblico e filiera evidence |

Per la definizione completa e le regole di unicità vedere [`docs/CONNECTIONS.md`](docs/CONNECTIONS.md).

## Riferimenti

- [Release beta](https://github.com/high-cde/zdos-microcosm-beta/releases)
- [Pull request della beta minima](https://github.com/high-cde/zdos-microcosm-beta/pull/1)
