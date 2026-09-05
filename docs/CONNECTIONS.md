# Connessioni canoniche — ZDOS Microcosm Beta

## Principio

Microcosm riconosce pubblicamente soltanto le fonti dell’ecosistema **ZDOS** e la webapp ufficiale **[x-zdos.it](https://x-zdos.it/)**. I collegamenti elencati sotto sono riferimenti canonici di progetto e documentazione; nella beta minima l’app resta offline e non apre connessioni di rete.

## Mappa univoca

| Identificatore | Fonte canonica | Ruolo | Connessione nella beta |
|---|---|---|---|
| `zdos` | [github.com/high-cde/ZDOS](https://github.com/high-cde/ZDOS) | Kernel, distro, build x86_64 ed Evidence Chain | Profilo locale read-only |
| `zlang` | [github.com/high-cde/Zlang](https://github.com/high-cde/Zlang) | Linguaggio, compiler, VM e contratto ZLB2 | Profilo locale read-only |
| `organism` | [github.com/high-cde/zdos-organism](https://github.com/high-cde/zdos-organism) | Runtime sperimentale dell’ecosistema | Riferimento ecosistema, non presente nel menu beta |
| `lab` | [github.com/high-cde/ZDOS-lab-v1](https://github.com/high-cde/ZDOS-lab-v1) | Catalogo, contratti, orchestrazione e package | Riferimento ecosistema, nessun sync automatico |
| `sec-portal` | [github.com/high-cde/ZDOS-SEC-PORTAL](https://github.com/high-cde/ZDOS-SEC-PORTAL) | HUD, telemetry e ledger locale sperimentale | Riferimento ecosistema, nessun endpoint attivo |
| `cybercore` | [github.com/high-cde/Z-CYBERCORE](https://github.com/high-cde/Z-CYBERCORE) | Security demo autorizzata e evidence-first | Riferimento ecosistema, nessuna capability attiva |
| `web` | [x-zdos.it](https://x-zdos.it/) | Punto di ingresso pubblico, filiera e prove | Link documentale; nessuna chiamata automatica |

## Regole di collegamento

Ogni identificatore deve avere un solo URL canonico. Non devono essere aggiunti mirror, endpoint personali, VPS, URL abbreviati o servizi esterni. Se una fonte cambia indirizzo, la modifica deve essere fatta nel README e in questo documento con una revisione esplicita.

La beta non importa codice remoto, non invia dati, non sincronizza manifest e non effettua autenticazione. Un’eventuale integrazione futura con manifest, evidence o SEC Portal dovrà essere opt-in, read-only per impostazione predefinita, autenticata e coperta da test di timeout, errore e provenienza.

## Distinzione tra profilo e connessione

La presenza di un link nel catalogo non significa che l’app sia collegata alla fonte. Le card ZDOS e Zlang mostrano profili locali informativi. La webapp x-zdos.it è un riferimento pubblico separato e non viene incorporata o interrogata dalla beta minima.
