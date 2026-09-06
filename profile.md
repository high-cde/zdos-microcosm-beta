# ZDOS Microcosm — Profilo operativo

## Identità

| Campo | Valore |
|---|---|
| Profile ID | `zdos.microcosm.beta` |
| Display name | `ZDOS Microcosm Beta` |
| Mode | `offline-first / portrait / Android` |
| Identity | `guest` |
| Posture | `READY` |
| Default policy | `DEFAULT-DENY` |
| Node binding | `IDENTIFIED / UNLINKED` finché non viene configurato un trasporto autenticato |

Il progetto resta un laboratorio locale. Il collegamento a un nodo privato non deve trasformare l’app in una shell remota o in un agente con privilegi impliciti. L’identità del nodo, il trasporto e le capability ammesse devono essere dichiarati prima dell’attivazione.

## Contratto del nodo privato ZDOS

Il binding previsto è intenzionalmente ristretto a un nodo che esponga un’identità verificabile e operazioni allowlist. Il profilo iniziale autorizza soltanto `node.status`, `evidence.append` e `manifest.preview`; non autorizza shell remota, esecuzione arbitraria, accesso libero al filesystem, socket generici, gestione di segreti o modifica di capability.

| Elemento | Regola |
|---|---|
| Node identity | Nome completo e fingerprint devono provenire dalla configurazione realmente disponibile, mai da un’ipotesi |
| Transport | Endpoint o canale dichiarato dall’utente; nessun endpoint inventato |
| Auth | Credenziale mantenuta fuori dal client e mai scritta nell’interfaccia o nei commit |
| Default | `UNLINKED` e `DENIED` finché l’identità non è verificata |
| Read model | Stato e ricevute possono essere letti; le azioni mutanti restano disabilitate |
| Failure mode | Nodo non riconosciuto, non raggiungibile o non verificabile = nessun tentativo di collegamento |

Il profilo ricevuto dalla VPS identifica il nodo come `vmi3082470.contaboserver.net`, con ID `ZNODE-FF0A135D12F83F61`, sistema `Ubuntu 22.04` e kernel `Linux 5.15.0-190-generic`. Il progetto espone quindi lo stato `IDENTIFIED / UNLINKED`: l’identità è registrata, ma non viene attivato alcun collegamento remoto perché il trasporto è ancora `not-configured`.

## ZTRACE — la “magia” trasparente

La magia del Microcosm è una firma di orientamento locale chiamata `ZTRACE`. È un fingerprint deterministico, non segreto e non crittografico, derivato da `Profile ID`, policy attiva, superficie corrente e numero di ricevute. Serve a rendere visibile quando la sessione cambia contesto e a collegare mentalmente ogni operazione alla postura del sistema.

La firma non invia dati, non identifica l’utente e non sostituisce una verifica crittografica. Nel nodo privato, una futura implementazione potrà affiancare a `ZTRACE` una vera attestazione verificata, senza riutilizzare questo valore come credenziale.

## Regole di sicurezza

Il profilo non deve contenere backdoor, comportamenti nascosti o “conoscenza” non documentata che modifichi i permessi. Le funzioni avanzate devono essere osservabili nell’interfaccia, coperte da test e accompagnate da una ricevuta locale. Qualsiasi bridge remoto deve essere esplicito, autenticato, read-only per impostazione predefinita e disattivabile senza perdere i dati locali.


## Profilo ZComm Telecom

`ZComm Telecom` è un interprete locale del profilo `ZLB2 telecom.local`. La sua funzione è didattica: rende osservabile una fixture di collegamento telecom senza stabilire un link reale.

| Capability | Stato | Significato |
|---|---|---|
| `telecom.status` | Allowlist | Legge la postura locale del profilo. |
| `telecom.scan` | Allowlist simulata | Legge la fixture UHF locale; non scansiona lo spettro reale. |
| `telecom.route.inspect` | Allowlist read-only | Mostra il percorso senza selezionare carrier o endpoint. |
| `telecom.tx` | Denied | Nessuna trasmissione, socket o invio di pacchetti. |

Un programma telecom valido deve contenere `telecom.status` e `halt`. La superficie registra una receipt `telecom.zlang` per ogni esecuzione, inclusi i rifiuti. Il parser non interpreta comandi oltre l’allowlist e non accede a modem, radio, interfacce di rete o dispositivi del sistema operativo.

Il contratto di riferimento è:

```zlang
telecom.status
telecom.scan band=uhf
telecom.route inspect
telecom.tx deny
halt
```

Il risultato atteso è `ACCEPTED`, con postura `LOCAL OBSERVATION`, route `READ-ONLY` e `transmit: DENIED`. L’estensione di questo profilo a reti reali richiederebbe un modello di minaccia, permessi espliciti, autenticazione, audit e un’ulteriore revisione del contratto.
