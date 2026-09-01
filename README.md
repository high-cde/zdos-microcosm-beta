# ZDOS Microcosm Beta

**ZDOS Microcosm Beta** è una piccola app Expo/React Native offline-first che presenta un menu minimo con i soli progetti ufficiali **ZDOS** e **Zlang**.

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
| Android | Export Expo verificato; APK nativo da produrre con una pipeline Android |

## Funzioni

La card **ZDOS** mostra il profilo del kernel/distro, il target x86_64, il percorso build/QEMU e il riferimento alla Evidence Chain. La card **Zlang** mostra il profilo compiler/VM, il contratto ZLB2 v2.5 e il fatto che la validazione nella beta è soltanto locale e informativa.

Le micro-immagini visualizzate nelle card sono stringhe ASCII colorate renderizzate con font monospace. Non vengono scaricate immagini esterne e non vengono aggiunti asset grafici per il menu.

## Avvio locale

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

## Struttura essenziale

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

## Confini di sicurezza

La beta usa un modello `DEFAULT-DENY`: nessun socket, nessuna shell Android, nessun accesso libero al filesystem, nessun compilatore nativo, nessuna ROM/emulatore e nessuna sincronizzazione automatica con ZDOS Lab o con un nodo remoto. I riferimenti a ZDOS e Zlang sono profili informativi, non dichiarazioni di esecuzione sul dispositivo.

## Prossimo passo per l’APK

Per trasformare l’export in un APK beta installabile occorre configurare una build Android riproducibile, scegliere un application ID definitivo, impostare versioning e signing, eseguire una build `preview` e allegare checksum e note di release. Il codice della home minima è già isolato e pronto per questo passaggio.

## Riferimenti

- [ZDOS](https://github.com/high-cde/ZDOS)
- [Zlang](https://github.com/high-cde/Zlang)
- [Pull request della beta minima](https://github.com/high-cde/zdos-microcosm-beta/pull/1)
