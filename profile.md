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
