# ZDOS Microcosm v1.0.0-beta.8

## Release

Questa release aggiorna l’APK standalone dal commit più recente del branch della beta e sincronizza il manifest Android alla versione `1.0.0-beta.8`.

Include:

| Area | Stato |
|---|---|
| Menu ZDOS / Zlang | Incluso |
| ZChain locale | Incluso |
| ZComm SIP/Videotel testuale | Incluso nel server |
| Contratto Zlang by ZDOS | Incluso |
| Connettore nodo ZDOS read-only | Incluso nel server |
| Policy `DEFAULT-DENY` | Attiva |
| Wallet e crypto esterne | Escluse |
| APK standalone | Compilata da `assembleRelease` |

L’APK è una prerelease di test. Non è firmata con un keystore di produzione e non attiva da sola un endpoint pubblico: il nodo ZDOS richiede URL HTTPS e token server-side configurati nell’ambiente di esecuzione.

## Verifiche

```text
TypeScript: PASS
Vitest: PASS
Server build: PASS
Android release build: PASS
```
