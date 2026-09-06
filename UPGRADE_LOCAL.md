# Upgrade locale — ZDOS Microcosm Beta

## Incremento

La beta locale ora include una **ZChain non monetaria** costruita offline con eventi hash-linked e una superficie di stato del nodo ZDOS locale.

## Nuove funzioni

| Funzione | Stato |
|---|---|
| Genesis ZChain | Attivo |
| Evento `node.status` | Attivo |
| Evento `evidence.append` all’apertura di ZDOS/Zlang | Attivo |
| Verifica SHA-256 della catena | Attiva |
| Rilevamento manomissioni | Testato |
| Network | Sempre negata |
| Remote execution | Sempre disabilitata |
| Valore monetario/token | Assente |

## Verifiche

```text
TypeScript: PASS
Test: 10 passed, 1 skipped
Android Expo export: PASS
```

L’artefatto è un export Android Expo locale. Non è un APK nativo firmato e non viene pubblicato online.

## Confini

La ZChain è un ledger locale di evidenza e integrità. Non è ancora una blockchain pubblica, non implementa consenso multi-nodo, non gestisce wallet, token, mining, pagamenti o account remoti.
