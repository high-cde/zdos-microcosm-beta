# ZDOS Microcosm — Analisi microservizi reali

## Sintesi

ZDOS Microcosm dispone già di una base applicativa adatta a diventare un prodotto utilizzabile: autenticazione OAuth, server Express, router tRPC tipizzato, storage proxy, notifiche, accesso Drizzle/MySQL e client tRPC mobile. Tuttavia, il router applicativo contiene ancora soltanto autenticazione e il database contiene soltanto la tabella `users`. Le superfici Zlang, ZComm e Zchain sono quindi principalmente contratti locali e dimostrazioni di policy.

La strategia più sicura è attivare microservizi piccoli, read-only o append-only, con contratti Zlang espliciti. Non bisogna trasformare ZDOS in una shell remota: ogni servizio deve avere capability finite, input validato, timeout, audit e un percorso di revoca.

## Stato effettivo attuale

| Area | Stato attuale | Valutazione |
|---|---|---|
| Autenticazione | OAuth e sessione già predisposti | Riutilizzabile subito per servizi per-utente |
| API | Express + tRPC già predisposti | Punto corretto per i microservizi |
| Database | `users` soltanto | Serve aggiungere tabelle per ricevute, pagine e stato |
| ZComm | Parser locale con allowlist e griglia 40×24 | Pronto come contratto; manca un catalogo remoto read-only |
| Node Pulse | GET pubblico verso `core-01` con validazione heartbeat | Primo microservizio reale già utilizzabile |
| Zchain | Profilo read-only, RPC `example.invalid` | Contratto pronto, backend reale non configurato |
| Evidence Chain | Ricevute nello stato della sessione React | Serve persistenza append-only |
| Orbot | Endpoint SOCKS5 configurabile | Non è un servizio autonomo e non viene avviato dall’app |
| Esecuzione Zlang | Validazione locale, nessun compilatore remoto | Deve rimanere deterministica e non arbitraria |

## Cosa possiamo offrire agli utenti

### 1. ZDOS Node Status

Un servizio pubblico per lo stato del nodo `core-01`, con heartbeat, versione del profilo, ultimo aggiornamento e stato `ONLINE`, `STALE` o `OFFLINE`. È la funzione a minor rischio perché il client già implementa il contratto e la validazione della freschezza.

Contratto Zlang suggerito:

```zlang
status node.profile
read node.heartbeat
attest node.status.observed
```

Capability consentite:

```text
node.profile.read
node.heartbeat.read
node.status.attest
```

Il servizio non deve permettere configurazione del nodo, shell, restart, upload o comandi amministrativi.

### 2. ZComm Service Directory

Un catalogo read-only di pagine Videotel firmate o versionate. L’app conserva il renderer locale 40×24, mentre il servizio restituisce soltanto pagine strutturate e già validate: titolo, codice `*Pagina#`, righe, versione e policy.

Contratto Zlang suggerito:

```zlang
status zcomm.catalog
storage.read ".videotex_index"
read zcomm.page "*01#"
attest zcomm.page.observed
```

Il server non deve restituire codice eseguibile. Deve rifiutare righe oltre 40 caratteri, codici non allowlisted, HTML arbitrario e link non autorizzati. Questa è la funzione che rende ZComm realmente utile senza tradire il modello Videotel.

### 3. Evidence Chain Ledger

Un servizio append-only per sincronizzare le ricevute locali tra installazioni autorizzate. Il client invia solo eventi minimizzati: superficie, operazione, stato, timestamp e fingerprint ZTRACE; non invia token, contenuto privato o credenziali.

Contratto Zlang suggerito:

```zlang
storage.append "evidence.receipt"
storage.read "evidence.recent"
attest evidence.batch.committed
```

Servono autenticazione utente, idempotency key, retention, paginazione e una policy che impedisca aggiornamenti o cancellazioni arbitrarie. La prima versione dovrebbe permettere soltanto append e lettura delle proprie ricevute.

### 4. Zlang Contract Validator

Un microservizio che valida programmi Zlang contro profili nominati, senza eseguirli. È utile per il playground, per ZComm e per integrazioni future.

Input:

```json
{
  "profile": "zdos.videotex.native.v1",
  "source": "status node.profile\nemit ..."
}
```

Output:

```json
{
  "accepted": true,
  "profile": "zdos.videotex.native.v1",
  "operations": ["STATUS", "EMIT"],
  "denied": [],
  "policy": "DEFAULT-DENY"
}
```

Il servizio deve essere un validatore deterministico, non un endpoint `eval`, non una shell e non un compilatore remoto.

### 5. Zchain Read Gateway

Un gateway read-only verso un endpoint RPC Zchain reale, da attivare soltanto quando sarà disponibile l’URL ufficiale e il suo schema. Il profilo esistente già vieta signing e broadcast e limita le operazioni a `READ CHAIN`, `READ BLOCK` e `VERIFY RECEIPT`.

Prima del collegamento vanno definiti endpoint, autenticazione, schema delle risposte, limiti di rate, timeout e comportamento in caso di dati non verificabili. Fino a quel momento `DEFAULT_ZCHAIN_RPC_URL` non deve essere trattato come servizio reale.

### 6. User Workspace e Zlang Capsules

Un piccolo spazio per salvare le capsule Zlang dell’utente: nome, profilo, sorgente validato, versione e ultimo utilizzo. È una funzione utile per rendere l’app vivibile, ma richiede autenticazione e una tabella dedicata. Le capsule devono rimanere dati dichiarativi validati, mai comandi eseguibili.

## Ordine consigliato

| Fase | Servizi | Perché |
|---|---|---|
| 1 | Node Status + ZComm Service Directory | Massimo valore con rischio basso; sfrutta i contratti già esistenti |
| 2 | Evidence Chain Ledger + User Workspace | Aggiunge continuità tra sessioni e personalizzazione |
| 3 | Zlang Contract Validator remoto | Centralizza la policy senza eseguire codice |
| 4 | Zchain Read Gateway | Dipende dall’endpoint Zchain ufficiale e dallo schema reale |
| 5 | Notifiche di stato opzionali | Da attivare solo con preferenze esplicite e rate limit |

## Due architetture possibili

| Approccio | Trade-off | Costo | Complessità |
|---|---|---:|---:|
| Servizi tRPC nello stesso backend Express, con MySQL per ricevute e pagine | Più semplice da mantenere; un singolo deploy; separazione logica tramite router e capability | Basso, riusa l’infrastruttura esistente | Bassa/Media |
| Servizi separati con API versionate e deploy indipendente | Isolamento e scalabilità migliori; più facile separare Zchain da ZComm | Medio/Alto, più deploy e monitoraggio | Media/Alta |

Per la prima release dei microservizi è preferibile la prima opzione: router tRPC separati (`node`, `zcomm`, `evidence`, `zlang`) nello stesso backend, tabelle dedicate e contratti Zlang versionati. In seguito Zchain può essere separato quando esisterà un RPC reale.

## Modello di capability consigliato

```text
node.profile.read
node.heartbeat.read
zcomm.catalog.read
zcomm.page.read
evidence.receipt.append
evidence.receipt.read_own
zlang.contract.validate
zchain.chain.read
zchain.block.read
zchain.receipt.verify
```

Non devono esistere capability generiche come `shell.exec`, `process.spawn`, `filesystem.all`, `socket.open`, `node.admin` o `chain.broadcast`.

## Conclusione

Il primo pacchetto realmente utile è **Node Status + ZComm Service Directory + Evidence Chain persistente**. Offre agli utenti uno stato del nodo consultabile, pagine Videotel navigabili e ricevute conservate, usando esclusivamente Zlang dichiarativo, read-only o append-only. È la strada con il miglior rapporto tra utilità, crediti, sicurezza e lavoro, senza inventare un’infrastruttura Zchain che oggi non è ancora collegata a un endpoint reale.
