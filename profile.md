# ZDOS Microcosm Beta — Profilo locale

## Identità

L’app presenta due soli progetti nel menu: `ZDOS` e `Zlang`. Le informazioni mostrate sono profili locali derivati dalla documentazione dell’ecosistema; non rappresentano un collegamento attivo, una sessione autenticata o un runtime eseguito sul telefono.

| Progetto | Ruolo visualizzato | Stato UI |
|---|---|---|
| `ZDOS` | Kernel, distro, build ed Evidence Chain | `VERIFIED` come profilo catalogato |
| `Zlang` | Compiler, VM e contratto ZLB2 | `VERIFIED` come profilo catalogato |

## Capability attive

| Capability | Stato | Significato |
|---|---|---|
| Menu progetti | `READY` | Le due card sono leggibili e interattive. |
| Profilo locale | `READ-ONLY` | La selezione mostra informazioni senza modificare dati. |
| Rete | `DENIED` | L’app minima non apre connessioni né sincronizza. |
| Shell/processi | `DENIED` | Nessun comando Android o processo del progetto viene eseguito. |
| Filesystem | `DENIED` | Nessun accesso libero al filesystem del dispositivo. |
| Backend/account | `DISABLED` | Non sono richiesti login, server o credenziali. |

## Regola di verità

Il badge `VERIFIED` nella card descrive il profilo del progetto nel catalogo di riferimento. Non equivale a una compilazione, a un boot o a una verifica hardware eseguita dall’APK. Qualsiasi futura integrazione dovrà mostrare separatamente `LOCAL PROFILE`, `EVIDENCE RECORD` e `RUNTIME TEST`.

## Dati remoti e nodo privato

La beta minima non collega nodi privati, VPS, SEC Portal o altri endpoint. Eventuali riferimenti presenti nella documentazione storica non costituiscono configurazione attiva dell’app. Nessun endpoint, token o segreto deve essere inserito nel client o nel repository.

## Capability future

L’importazione di manifest del Lab, la visualizzazione di evidence record con checksum, il collegamento read-only a SEC Portal e la generazione di un APK firmato sono attività successive. Prima dell’attivazione servono schema versionato, autenticazione, timeout, test negativi, gestione degli errori e un gate CI riproducibile.
