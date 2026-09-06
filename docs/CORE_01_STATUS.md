# Microcosm e ZDOS First Node `core-01`

Microcosm può leggere lo stato pubblico del nodo ZDOS First Node tramite un endpoint HTTPS read-only. Il client usa `EXPO_PUBLIC_ZDOS_NODE_STATUS_URL` quando è definita; in assenza di configurazione usa:

```text
https://x-zdos.it/api/node/core-01/status
```

## Contratto

La risposta deve essere JSON con schema `zdos.node.status.v1` e almeno questi campi:

```json
{
  "schema": "zdos.node.status.v1",
  "node_id": "core-01",
  "status": "ONLINE",
  "policy": "default-deny",
  "capabilities": ["heartbeat", "public-status", "integrity-attestation"],
  "heartbeat_at": "2026-09-06T00:00:00.000Z",
  "uptime_seconds": 123,
  "execution": "heartbeat-only",
  "network": "no-listener"
}
```

Il client considera il nodo `ONLINE` solo quando `status` è `ONLINE` e `heartbeat_at` non è più vecchio di 90 secondi. Un errore HTTP, un payload non valido o un timeout produce `OFFLINE`; un heartbeat valido ma vecchio produce `STALE`.

## Sicurezza

L’endpoint deve essere soltanto `GET`, deve restituire un payload filtrato e non deve esporre `activation.json`, `evidence.jsonl`, sorgenti, bytecode, credenziali o file presenti nella VPS. Non devono essere aggiunti endpoint `POST`, shell, SSH, comandi Zlang remoti o accesso al filesystem.

La dicitura `ONLINE` nell’app significa che Microcosm ha ricevuto un heartbeat recente via HTTPS. La dicitura `LOCAL HASH ATTESTATION` significa che il nodo pubblica hash locali; non equivale a una firma esterna o a una verifica di consenso distribuito.

## Build Android

Dopo aver configurato l’endpoint, eseguire i controlli:

```bash
pnpm check
pnpm test
pnpm lint
pnpm build
```

La variabile Expo può essere impostata durante la build:

```bash
EXPO_PUBLIC_ZDOS_NODE_STATUS_URL=https://x-zdos.it/api/node/core-01/status pnpm exec expo export --platform android
```
