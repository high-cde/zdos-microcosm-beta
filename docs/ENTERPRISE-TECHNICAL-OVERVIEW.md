# ZDOS // MICROcosm — Enterprise Technical Overview

## Executive summary

ZDOS // MICROcosm è una superficie applicativa controllata per prodotti che devono combinare UX mobile/web, automazione bounded, messaggistica local-first e integrazioni Web3 verificabili senza trasformare il backend in una shell remota o in un custodial wallet.

Il progetto dimostra un approccio **capability-first**:

- ogni superficie dichiara il proprio perimetro;
- ogni input viene validato rispetto a un profilo;
- ogni evento utile produce una receipt osservabile;
- la rete è negata per default;
- la blockchain viene separata dal runtime locale e introdotta in modalità read-only prima di qualsiasi firma.

## Product surface

### ZDOS

ZDOS è il control plane concettuale: postura, nodo, capability, receipt, chain head locale e stato operativo.

### Zlang

Zlang è il linguaggio di policy e programma bounded. Nel Microcosm non significa eseguire codice arbitrario: significa interpretare un sottoinsieme dichiarato, testabile e con `halt` obbligatorio.

### ZComm

ZComm è la superficie di comunicazione local-first. I messaggi vengono accodati sul dispositivo, marcati `PENDING` e sincronizzati soltanto verso un endpoint HTTPS esplicito. Offline non è un errore: è uno stato operativo previsto.

### DSN Web3

Il token `$DSN` è esposto come integrazione ERC-20 su Polygon Mainnet:

```text
Contract: 0xfc90516a1f736FaC557e09D8853dB80dA192c296
Chain ID: 137
Decimals: 18
Mode: read-only scaffold
```

Il design non custodisce seed phrase o private key. Un eventuale wallet deve firmare localmente nel wallet dell’utente.

## Trust boundaries

```text
[Client Expo]
  ├─ local Zlang validator
  ├─ local ZComm queue
  ├─ local receipt chain
  └─ wallet provider (future, non-custodial)
          │
          ▼
[Express + tRPC]
  ├─ typed procedures
  ├─ auth/session
  ├─ audit metadata
  └─ read-only chain adapter (future)
          │
          ▼
[Polygon RPC]
  └─ public reads only until capability is explicitly granted
```

Il backend non deve ricevere private key, seed phrase o materiale di firma. Un RPC non è un wallet: permette letture pubbliche e, in generale, trasmissione di transazioni firmate altrove; Microcosm mantiene quest’ultima capacità disabilitata.

## Enterprise integration points

| Integration point | Contract | Default |
|---|---|---|
| Zlang | allowlisted source + `halt` | deny unknown syntax |
| ZComm sync | HTTPS POST, retry-safe | offline queue |
| Evidence | receipt + local chain head | integrity checked |
| Auth | OAuth/session template | protected procedures available |
| Database | Drizzle/MySQL | schema extensible |
| Web3 | Polygon ERC-20 read adapter | RPC pending |
| Transactions | wallet-signed capability | disabled |

## DSN rollout policy

### Stage A — metadata

Contract address, chain ID and decimals are documented and displayed. No RPC is required.

### Stage B — read-only RPC

The app verifies:

- `eth_chainId == 137`;
- token `symbol()`;
- token `decimals() == 18`;
- `balanceOf(publicAddress)`;
- RPC health and timeout behaviour.

The UI must distinguish `RPC_PENDING`, `ONLINE` and `DEGRADED`.

### Stage C — wallet connection

A user connects a wallet through a standard provider. The app stores only the public address and session metadata. No key material enters the server.

### Stage D — explicit transactions

Only after contract review, simulation, gas policy, allowlist and testnet validation should a transaction capability be considered. The user must see target, function, amount, chain and estimated gas in the wallet confirmation.

## Operational controls

Recommended production controls:

- pin the chain ID and contract address;
- permit only approved RPC origins;
- rate-limit public RPC reads;
- redact RPC credentials from logs;
- keep `.env.web3.local` outside Git;
- monitor RPC latency and error rate;
- add a kill switch for Web3 surfaces;
- store audit events without storing secrets;
- run dependency, type, test and build checks in CI;
- publish a threat model before enabling writes.

## Why this is relevant to technology partners

Microcosm can be used as:

1. a reference UX for a bounded operating surface;
2. a sandbox for Zlang policies and developer tools;
3. a local-first messaging shell for constrained connectivity;
4. a non-custodial Web3 front-end foundation;
5. a demonstrator for capability grants, auditability and fail-closed product design.

The product value is not only the visual layer. It is the separation of concerns: a readable client, a typed backend, deterministic local evidence and a Web3 boundary that can be activated progressively.

## Verification checklist

Before a partner demo:

- [ ] Pages URL loads from a clean browser.
- [ ] `pnpm check` passes.
- [ ] Vitest suite passes.
- [ ] Backend bundle builds.
- [ ] DSN contract address is pinned.
- [ ] Polygon chain ID is pinned to 137.
- [ ] No private key is present in the repository or APK environment.
- [ ] RPC state is labelled accurately.
- [ ] Transactions remain disabled unless explicitly approved and implemented.

## References

- [ZDOS Microcosm repository](https://github.com/high-cde/zdos-microcosm-beta)
- [Live GitHub Pages app](https://high-cde.github.io/zdos-microcosm-beta/)
- [DSN contract on PolygonScan](https://polygonscan.com/token/0xfc90516a1f736FaC557e09D8853dB80dA192c296)
- [Expo documentation](https://docs.expo.dev/)
- [tRPC documentation](https://trpc.io/)
- [Drizzle ORM documentation](https://orm.drizzle.team/)
