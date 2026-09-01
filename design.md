# Design — ZDOS Microcosm Minimal Beta

## Obiettivo

L’interfaccia comunica che l’app è una console locale, controllata e minimale. La home contiene soltanto due progetti: **ZDOS** e **Zlang**. Ogni progetto è una card selezionabile che apre un profilo informativo nello stesso flusso, senza navigazione profonda e senza azioni distruttive.

## Gerarchia della schermata

| Ordine | Elemento | Funzione |
|---:|---|---|
| 1 | `ZDOS / MICROcosm` + `OFFLINE BETA` | Identità e stato locale |
| 2 | `PROJECTS` | Titolo della console |
| 3 | `SYSTEM POSTURE / READY` | Postura di sicurezza |
| 4 | `PROJECT MENU / 02` | Conferma delle sole due voci |
| 5 | Card `ZDOS` | Profilo kernel, distro ed Evidence Chain |
| 6 | Card `Zlang` | Profilo compiler, VM e ZLB2 |
| 7 | Pannello profilo locale | Dettagli del progetto selezionato |

## Palette

| Token | Valore | Uso |
|---|---|---|
| `void` | `#070A0F` | Sfondo globale e cornici ASCII |
| `panel` | `#101820` | Postura e profilo locale |
| `panelSoft` | `#0C131A` | Card progetto |
| `cyan` | `#28E6F0` | Identità e progetto ZDOS |
| `lime` | `#B7FF2A` | Stato `READY`/`VERIFIED` e azioni |
| `violet` | `#8B5CF6` | Identità visuale Zlang |
| `ink` | `#EAF2F4` | Testo principale |
| `muted` | `#8A9BA3` | Testo secondario |
| `line` | `#263842` | Separatori e bordi neutri |

Il significato non deve dipendere soltanto dal colore: ogni stato include sempre una parola leggibile come `READY`, `VERIFIED`, `OFFLINE` o `DENIED`.

## Micro-immagini ASCII

Le card usano micro-immagini testuali, non file immagine:

```text
ZDOS                 ZLANG
  /\_/\              .----.
 ( o.o )             / ZLB2 \
  > ^ <              `----´
```

ZDOS usa il cyan, mentre Zlang usa il violet. Il font è monospace e le righe mantengono un’altezza costante. Le immagini ASCII sono parte del componente UI e restano disponibili offline.

## Interazioni

La pressione di una card riduce leggermente opacità e scala, poi mostra il profilo locale. Il pulsante `CHIUDI PROFILO` ripristina il menu. Non esistono azioni di esecuzione, sincronizzazione, login o modifica dei permessi.

Tutti i contenuti sono dentro `ScreenContainer` con safe area completa. La schermata è verticale, scorrevole e adatta all’uso con una mano. I `Pressable` usano `style`, non `className`, per garantire l’attivazione degli eventi.

## Stati

`OFFLINE BETA` indica che non è previsto un backend. `READY` indica che la console locale è pronta. `VERIFIED` descrive il profilo del progetto nel catalogo, non una build eseguita dal telefono. `READ-ONLY UI` chiarisce che l’app non modifica sorgenti o configurazioni.

## Non obiettivi

La beta non include terminale reale, shell Android, compilatore nativo Zlang, kernel ZDOS eseguibile, emulatori, ROM, socket, accesso libero al filesystem, account, backend o sincronizzazione automatica. Queste capacità non devono essere suggerite da elementi grafici o testi ambigui.
