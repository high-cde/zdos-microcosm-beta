# ZDOS Microcosm v1.0.0-beta.3

## Upgrade

Questa prerelease aggiunge la prima build Android nativa locale della beta Microcosm, insieme alla ZChain locale non monetaria.

| Componente | Stato |
|---|---|
| Menu ZDOS / Zlang | Attivo |
| Profili locali | Attivi |
| ZChain genesis | Attivo |
| `node.status` locale | Attivo |
| `evidence.append` | Attivo |
| Verifica SHA-256 | Attiva |
| Test anti-manomissione | Attivo |
| Android native project | Incluso |
| APK release | Asset della prerelease |
| Rete e remote execution | Disabilitate |

## APK

L’asset `zdos-microcosm-beta-release.apk` è una build release compilata localmente con Gradle. Non è una release di store e non è firmata con un keystore di produzione.

SHA-256:

```text
ef4a382b477507b119e66f73086acc0047f84592a4de605bf5c11e8d3aed73ed
```

## Verifiche

```text
TypeScript: PASS
Vitest: 10 passed, 1 skipped
Gradle assembleRelease: PASS
```

## Limiti dichiarati

ZChain è un ledger locale di evidenza e integrità. Non è una blockchain pubblica e non implementa consenso multi-nodo, wallet, token, mining, pagamenti, account remoti o sincronizzazione automatica.
