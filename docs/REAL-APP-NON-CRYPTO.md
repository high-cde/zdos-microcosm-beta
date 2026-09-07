# ZDOS Microcosm — app reale non-crypto

## Perimetro attivo

Microcosm può funzionare come client reale di un servizio ZComm/ZDOS senza diventare un wallet e senza collegarsi al mondo crypto esterno. Il modello operativo è una app di identità applicativa, messaggistica Videotel testuale, manifest, audit e prove locali.

| Capability | Stato |
|---|---|
| ZComm HTTPS testuale | Attivo nel server |
| Contratto SIP/Videotel | Preservato |
| Zlang by ZDOS node contract | Incluso |
| Nodo ZDOS read-only | Connettore attivo se URL/token sono configurati |
| Manifest read-only | Connettore attivo se il nodo lo espone |
| Evidence/ZChain locale | Attiva |
| Auth bearer server-side | Attiva |
| Rate limit e CORS allowlist | Attivi |
| Wallet/token/seed phrase | Esclusi |
| Blockchain/crypto esterni | Esclusi |
| Shell/radio/remote execution | Negati |

## Nodo Zlang by ZDOS

Il contratto è in `server/zdos-node.ts` e dichiara `status.read`, `manifest.read`, `evidence.append` e i rifiuti `shell.deny`, `radio.deny`, `tx.deny`, `crypto.deny`.

Il client server-side contatta soltanto un endpoint HTTPS allowlisted. Non sono consentiti URL HTTP, redirect verso hostname diversi o credenziali nell’APK. Il nodo remoto deve esporre almeno:

```text
GET /api/health
GET /api/manifest
```

## Attivazione su hosting

Configurare le variabili soltanto nel server persistente o nel provider HTTPS:

```bash
ZCOMM_API_TOKEN=<secret-lungo>
ZDOS_NODE_URL=https://node.example.tld
ZDOS_NODE_TOKEN=<secret-read-only>
ZCOMM_ORIGINS=https://x-zdos.it
```

Prima dell’apertura pubblica servono TLS valido, reverse proxy, secret manager, log senza token, backup dell’audit e monitoraggio. Il repository contiene il codice e i test, ma non attiva da solo un endpoint pubblico né inventa le credenziali del nodo ZDOS.

## Perché non è un wallet

L’app non conserva seed phrase, chiavi private, token, indirizzi blockchain, saldi o transazioni finanziarie. La ZChain è una catena di evidenze hash-linked per audit e provenienza, non una blockchain monetaria.

L’obiettivo è costruire una superficie più ampia di un wallet per il mondo ZDOS/Zlang — nodo, contratti, manifest, messaggi, prove e policy — senza assumere i rischi e le dipendenze del mondo crypto esterno.
