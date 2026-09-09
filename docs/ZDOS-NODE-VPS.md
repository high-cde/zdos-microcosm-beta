# ZDOS Node per VPS

## Scopo

ZDOS Node è un runtime headless per Linux/VPS. Collega il profilo ZDOS, il sottoinsieme locale di Zlang e le operazioni ZComm tramite un processo leggero senza interfaccia grafica.

La prima versione è progettata per consumare poca memoria e poca CPU. Non apre socket pubblici, ascolta solo su `127.0.0.1`, mantiene una coda locale e avvia ogni nodo con `DEFAULT-DENY`.

## Architettura

```text
ZDOS Microcosm
      │ HTTPS o client locale, da aggiungere con allowlist
      ▼
ZDOS Node / Zlang local evaluator
      ├── /health
      ├── /v1/status
      ├── /v1/zlang
      ├── /v1/zcomm/queue
      ├── /v1/radio/receive
      └── /v1/radio/transmit → DENIED
              │
              └── futuro adapter radio verificato
```

Il nodo non tratta un’antenna come una capacità automatica. Un adapter radio futuro dovrà dichiarare hardware, driver, banda, potenza, modalità, antenna e policy. Fino ad allora il nodo può ricevere frame consegnati da un adapter e conservarli come `untrusted`, ma non trasmette.

## Endpoint locali

| Endpoint | Metodo | Comportamento |
|---|---:|---|
| `/health` | GET | Stato minimo del processo. |
| `/v1/status` | GET | Identità, postura e ultime ricevute. |
| `/v1/zlang` | POST | Valida il profilo `node.local` limitato. |
| `/v1/zcomm/queue` | POST | Accoda un messaggio senza trasmetterlo. |
| `/v1/radio/receive` | POST | Registra un frame come non verificato. |
| `/v1/radio/transmit` | POST | Rifiuta sempre nella versione base. |

## Programma Zlang supportato

```text
node.status
gps.status
radio.status
radio.receive
zcomm.queue
evidence.commit
halt
```

Il parser è volutamente piccolo. Comandi sconosciuti, shell, socket arbitrari, `radio.tx` e `radio.transmit` vengono rifiutati.

## Installazione su VPS

Prerequisiti: Linux con Node.js 20 o superiore, `npm`, privilegi root per installare il servizio e systemd.

```bash
sudo bash scripts/install-zdos-node.sh
curl http://127.0.0.1:8787/health
curl http://127.0.0.1:8787/v1/status
```

Il servizio usa:

```text
/opt/zdos-node
/var/lib/zdos-node
```

Il processo gira con l’utente non privilegiato `zdos-node`, `NoNewPrivileges=true`, filesystem protetto e sola scrittura nella directory dati.

## Collegamento a Microcosm

Il collegamento applicativo dovrà essere aggiunto in una fase successiva tramite un endpoint HTTPS autenticato e una allowlist di capability. La VPS non deve essere esposta direttamente a Internet prima di avere:

- autenticazione a chiave o mTLS;
- rate limiting;
- allowlist IP o VPN;
- replay protection;
- audit remoto;
- revoca del nodo;
- TLS verificato;
- endpoint di sincronizzazione idempotenti.

Per ora il processo ascolta solo su localhost. Questa è una scelta intenzionale.

## Adapter radio futuro

L’adapter radio deve essere un processo separato dal core. Il core deve vedere soltanto eventi normalizzati:

```json
{
  "adapter": "radio-verified-01",
  "direction": "RX",
  "payload": "...",
  "receivedAt": "2026-09-09T17:00:00.000Z",
  "verified": false
}
```

La trasmissione dovrà richiedere un profilo hardware verificato, durata massima, frequenza autorizzata, potenza limitata, operatore, ricevuta e policy. Non deve essere implementata tramite una generica esecuzione SDR senza controllo.

## Due opzioni di deployment

| Approccio | Vantaggi e compromessi | Costo | Complessità |
|---|---|---:|---:|
| Node su VPS con systemd | Massimo controllo, basso consumo e possibilità di adapter radio. Richiede hardening e manutenzione della VPS. | Dipende dalla VPS già disponibile; una VM cloud dedicata può partire da circa 10 USD/mese. | Media |
| Node gestito come servizio web persistente | Deployment più semplice, TLS e gestione più facile. Meno adatto a USB, driver radio e controllo OS. | Dipende dal provider e dall’uso. | Bassa |

Per il caso di un gateway radio e di hardware collegato, la VPS Linux è l’opzione più flessibile. Per sola sincronizzazione ZComm e gestione Zlang, un servizio gestito è più semplice e consuma meno tempo operativo.

## Roadmap

1. Stabilizzare il core headless e i test.
2. Aggiungere autenticazione locale e token di enrollment.
3. Aggiungere coda ZComm persistente con checksum e idempotenza.
4. Aggiungere sync HTTPS allowlist verso Microcosm.
5. Aggiungere GPS solo se esiste una sorgente hardware o un fix esplicito.
6. Aggiungere adapter radio in sola ricezione.
7. Verificare hardware, driver e profilo radio.
8. Valutare la trasmissione soltanto con policy, hardware e autorizzazioni appropriate.

## Limiti attuali

Questa prima versione non:

- parla ancora con l’APK Microcosm;
- controlla una radio reale;
- trasmette FM o AM;
- espone API pubbliche;
- esegue programmi arbitrari Zlang;
- apre shell o comandi Linux;
- usa credenziali remote;
- determina automaticamente se un’antenna è trasmittente.

Questi limiti sono parte della sicurezza del progetto e non sono bug.
