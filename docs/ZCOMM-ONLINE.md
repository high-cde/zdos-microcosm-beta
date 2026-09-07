# ZComm online — contratto Zlang by ZDOS

## Scopo

ZComm online è il trasporto testuale HTTPS del profilo Videotel/SIP. Non sostituisce e non modifica il contratto storico: conserva pagine numeriche, navigazione `*123#`, profilo 40×24, nickname, messaggeria e modalità testuale a 1200 baud downstream / 75 baud upstream come parametri descrittivi.

> ZComm online non è un modem, non usa radio, non apre socket dal client Android e non esegue comandi remoti.

## Contratto

```text
ZLANG ZDOS ZCOMM SIP-VIDEO-TEL V23 PAGE-40X24 DEFAULT-DENY HALT
```

Il runtime server espone soltanto:

| Endpoint | Funzione | Accesso |
|---|---|---|
| `GET /api/zcomm/status` | Stato pubblico non sensibile del servizio | Pubblico |
| `POST /api/zcomm/session` | Crea una sessione nickname | Bearer token |
| `POST /api/zcomm/page` | Naviga pagine `*NNN#` | Bearer token + sessione |
| `POST /api/zcomm/message` | Invia messaggio testuale limitato | Bearer token + sessione |

## Sicurezza

L’accesso operativo richiede `ZCOMM_API_TOKEN`. Il confronto del token usa confronto constant-time. Il rate limit predefinito è di 30 richieste per minuto per indirizzo client. I messaggi sono limitati a 240 caratteri e i body HTTP a 256 KB.

Il CORS è chiuso per impostazione predefinita. Le origini ammesse devono essere dichiarate esplicitamente in `ZCOMM_ORIGINS`, separate da virgola. Il server invia `nosniff`, `no-store` e `no-referrer`.

Le capability `radio`, `tx`, `shell`, `remote execution`, scansione hardware, carrier selection e accesso al filesystem restano sempre negate. La messaggistica in questa prima versione vive in memoria e non è ancora un archivio persistente.

## Attivazione controllata

Impostare i segreti soltanto nell’ambiente del server, mai nel repository o nell’APK:

```bash
export ZCOMM_API_TOKEN="token-lungo-generato-da-un-secret-manager"
export ZCOMM_ORIGINS="https://x-zdos.it"
```

Avviare il server con HTTPS terminato da un reverse proxy affidabile. Non esporre direttamente una porta di sviluppo su Internet. Prima dell’attivazione pubblica eseguire rotazione token, log redaction, backup e test di rate limit.

## Test locale

```bash
pnpm check
pnpm vitest run --passWithNoTests
pnpm build
ZCOMM_API_TOKEN=test-token pnpm start
```

La configurazione non attiva automaticamente il servizio online: il server resta non operativo per le route private finché `ZCOMM_API_TOKEN` non è configurato.
