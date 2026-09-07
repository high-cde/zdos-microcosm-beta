# Statuto ZDOS Microcosm, ZComm e First Node

**Versione:** 1.0.0-draft

**Data di redazione:** 8 settembre 2026

**Ambito:** `high-cde/zdos-microcosm-beta`, integrazione ZDOS/Zlang, ZComm, First Node VPS, GitHub Pages e build Android APK.

**Autore:** Manus AI

> Questo statuto definisce ciò che il sistema è autorizzato a fare, ciò che non deve fare, quali prove sono necessarie per dichiarare una capacità disponibile e quali condizioni impediscono di considerare una release completata.

## 1. Scopo e stato normativo

ZDOS Microcosm è un client mobile e web per superfici ZDOS locali, osservabili e limitate. Il client non è un sistema operativo general-purpose, non è una shell remota e non è un agente privilegiato. Ogni funzione deve avere un contratto leggibile, una capability esplicita, un limite operativo, un comportamento di rifiuto e una ricevuta locale quando viene eseguita.

Lo stato predefinito è **offline-first** e **DEFAULT-DENY**. Una connessione esterna è disponibile soltanto quando l’endpoint è dichiarato, usa il trasporto previsto, rispetta lo schema del contratto e non amplia le capability autorizzate.

Lo stato corrente della consegna non è una release finale su `main`. Le modifiche sono nella Pull Request [#11](https://github.com/high-cde/zdos-microcosm-beta/pull/11), che richiede revisione perché il branch principale è protetto.

## 2. Identità del sistema

| Campo | Valore normativo |
|---|---|
| Progetto | ZDOS // Microcosm |
| Profile ID | `zdos.microcosm.beta` |
| Modalità | Offline-first, mobile/web, portrait su Android |
| Identità applicativa | Guest |
| Postura | `READY` per le superfici locali; `UNLINKED` per il nodo remoto finché non verificato |
| Policy | `DEFAULT-DENY` |
| Storage | Coda persistente locale tramite AsyncStorage |
| Shell | Non disponibile |
| Esecuzione remota | Non disponibile |
| Network | Negata per default; solo endpoint espliciti |
| Prova locale | Receipt e ZTRACE non crittografici |
| Fonte codice | Repository GitHub `high-cde/zdos-microcosm-beta` |

## 3. Principi vincolanti

### 3.1 Default-deny

Ogni comando, capability, URL, frame e azione non riconosciuta deve essere respinta. Il rifiuto deve essere osservabile e non deve produrre effetti collaterali nascosti.

### 3.2 Separazione locale/remota

Il modello locale è la fonte di continuità dell’esperienza. La rete può aggiungere stato osservabile o sincronizzazione esplicita, ma non può sostituire la coda locale, trasformare l’app in una shell o introdurre privilegi impliciti.

### 3.3 Provenienza verificabile

Un nodo, un record o un endpoint non deve essere presentato come verificato sulla base del solo nome. L’identità deve provenire da una risposta contrattuale valida o da configurazione dichiarata. IP, hostname, token e chiavi private non devono essere inseriti nel client o nei commit.

### 3.4 Read-only per il control plane

Il collegamento al First Node è osservativo. Le capability iniziali sono `node.status`, `evidence.append` e `manifest.preview` come profilo dichiarativo. La beta non abilita modifica branch, pubblicazione release, gestione capability, shell, filesystem remoto o esecuzione arbitraria.

### 3.5 Fail-closed

Endpoint mancante, trasporto non ammesso, timeout, risposta malformata, status non riconosciuto o frame non valido devono lasciare disponibili i dati locali e negare l’operazione remota.

### 3.6 Trasparenza

Ogni funzione di rete deve essere visibile nella UI. Ogni tentativo significativo deve produrre una receipt locale con operazione, stato e dettaglio. Non sono ammessi canali nascosti, callback non dichiarati o telemetria non documentata.

## 4. Architettura

L’architettura è composta da quattro piani distinti:

| Piano | Responsabilità | Limite |
|---|---|---|
| Microcosm client | UI Expo Router, superfici locali, receipts e coda | Non esegue shell o kernel |
| Zlang contract plane | Profili ZLB2 bounded per terminale, ZComm e MECCANINCAME | Rifiuta sintassi non allowlisted |
| First Node control plane | Stato read-only del servizio `zdos-first-node.service` | Nessuna esecuzione remota |
| Relay CB | Trasporto realtime per frame ZComm bounded | Solo WebSocket `wss://`, nessun protocollo arbitrario |

Il repository ZDOS e il repository Zlang restano fonti separate. Microcosm consuma contratti e stato; non incorpora kernel, compilatore nativo, QEMU o runtime remoto.

## 5. Catalogo delle superfici

| Codice | Superficie | Stato | Funzione autorizzata |
|---|---|---|---|
| 00 | Zlang Micro Terminal | `READY` | Comandi demo bounded |
| 01 | Terminale locale | `READY` | Stato locale e rifiuti espliciti |
| 02 | Zlang Validator | `ACCEPTED`/`DENIED` | Validazione del profilo ZLB2 senza compilatore nativo |
| 03 | ZRetro Studio | `VERIFIED` | Preview contrattuale IR |
| 04 | Evidence Chain | `READY` | Ricevute della sessione |
| 05 | Security | `DENIED` | Matrice capability default-deny |
| 06 | ZDOS Profile | `ROADMAP`/descrittiva | Identità e policy del nodo |
| 07 | Node Pulse / antenna | `READY` quando verificato | Heartbeat read-only del First Node |
| 08 | Zchain Zliang | `ROADMAP` | Nessuna blockchain operativa nella beta |
| 09 | ZComm Videotel | `EXPERIMENTAL` | Messaggeria CEPT 40×24, coda, sync e CB |
| 10 | MECCANINCAME | `READY` locale | Pairing locale bounded in stile KDE Connect |

Gli stati `READY`, `ACCEPTED` e `VERIFIED` non devono essere interpretati come attestazione di produzione quando riguardano una preview o una receipt locale.

## 6. Contratto ZComm Videotel

ZComm reinterpreta il modello Videotel come messaggeria testuale local-first. Le stanze predefinite sono `piazza`, `officina` e `retro`. Ogni messaggio ha identificativo, stanza, nickname, corpo, timestamp e stato `pending` quando non è stato sincronizzato.

Il profilo locale di riferimento è:

```zlang
zcomm.status
zcomm.page.list
zcomm.room.list
zcomm.message.queue
zcomm.sync status
zcomm.tx deny
halt
```

Le capability sono:

| Capability | Stato | Effetto |
|---|---|---|
| `zcomm.status` | Allowlist | Legge lo stato del profilo |
| `zcomm.page.read` | Allowlist | Legge stanze e pagine locali |
| `zcomm.message.queue` | Allowlist | Accoda messaggi limitati a 240 caratteri |
| `zcomm.sync.push` | Condizionata | Invia la coda a un endpoint HTTPS esplicito |
| `zcomm.tx` | Negata | Nessuna radio, modem, socket generico o trasmissione implicita |

Un programma ZComm deve contenere `zcomm.status` e `halt`. Sintassi shell, credenziali, socket e comandi non presenti nell’allowlist devono produrre `DENIED` senza tentare operazioni di sistema.

## 7. Antenna First Node VPS

L’antenna è un probe read-only verso il servizio VPS `zdos-first-node.service`. L’endpoint non è hard-coded. La variabile prevista è:

```text
EXPO_PUBLIC_ZDOS_FIRST_NODE_URL=https://<endpoint-vps>
```

Il client effettua soltanto:

```text
GET <endpoint-vps>/v1/status
```

La risposta è accettata soltanto se conforme a `zdos-node-status/v1`:

```json
{
  "schema": "zdos-node-status/v1",
  "nodeId": "core-01",
  "nodeName": "zdos-first-node",
  "status": "ONLINE",
  "posture": "DEFAULT-DENY",
  "capabilities": ["node.status"]
}
```

| Condizione | Stato UI | Comportamento |
|---|---|---|
| Endpoint assente | `NOT_CONFIGURED` | Nessun tentativo di rete |
| Endpoint non HTTPS | `DENIED` | Nessuna richiesta |
| Timeout o nodo irraggiungibile | `OFFLINE` | Coda locale invariata |
| Schema o status invalidi | `DENIED` | Nodo non verificato |
| Risposta valida con `ONLINE` | `CONNECTED` | Stato read-only osservabile |

Il probe non abilita comandi, scritture, shell, autenticazione implicita o accesso a filesystem remoto.

## 8. CB realtime per ZComm

Il CB è il trasporto realtime opzionale per la versione web Pages e per l’APK. Il client richiede un relay dichiarato tramite:

```text
EXPO_PUBLIC_ZCOMM_CB_WS_URL=wss://<relay-vps>/zcomm
```

Il workflow GitHub Pages legge `ZCOMM_CB_WS_URL`. Il workflow Android APK legge la stessa variabile. Se la variabile è assente, il client resta offline-first.

Sono ammessi soltanto URL `wss://`. Gli URL `ws://`, gli endpoint arbitrari e i frame non validi devono essere respinti.

Il frame ammesso è:

```json
{
  "type": "zcomm.cb.message",
  "roomId": "piazza",
  "nick": "ALICE",
  "body": "ciao ZDOS",
  "createdAt": "2026-09-08T00:00:00.000Z"
}
```

I limiti del client sono:

| Campo | Limite |
|---|---|
| `type` | Deve essere `zcomm.cb.message` |
| `roomId` | Massimo 32 caratteri |
| `nick` | Massimo 24 caratteri |
| `body` | Massimo 240 caratteri |
| `createdAt` | Stringa obbligatoria |
| Trasporto | Solo WebSocket TLS `wss://` |
| Shell | Sempre negata |
| Socket arbitrari | Sempre negati |
| Frame malformati | Ignorati senza esecuzione |

La ricezione di un frame CB aggiunge un messaggio alla sessione locale. L’invio conserva la receipt locale e usa il relay soltanto se il socket è nello stato `CONNECTED`. Se il relay non è connesso, il messaggio resta nella coda offline.

Il relay deve essere implementato sulla VPS o su un servizio esplicitamente controllato dall’utente. La sua assenza non deve essere mascherata da uno stato online simulato.

## 9. MECCANINCAME

MECCANINCAME è un profilo locale ispirato al pairing tra dispositivi, senza implementare il protocollo KDE Connect e senza aprire connessioni esterne. Il contratto è `zdos-meccanincame/v1`.

```zlang
meccanincame.status
meccanincame.pair.local
meccanincame.shell deny
meccanincame.network deny
halt
```

Le sole capability sono `device.status` e `pair.local`. Lo stato contiene `network: DENIED`, `shell: DENIED` e `transport: LOCAL_ONLY`. Un nome peer vuoto non produce pairing. Un comando shell o una capability non prevista producono `DENIED`.

Il pairing locale è un record applicativo osservabile. Non rappresenta autenticazione di rete, identità crittografica, autorizzazione su un computer o accesso a file.

## 10. Pulsante X-ZDOS.IT

La Home contiene un link esplicito a `https://x-zdos.it`. Il link apre il browser di sistema. Non è un canale di pairing, non è un relay CB e non concede capability all’app.

La webapp `x-zdos.it` è trattata come superficie pubblica separata. La sua presenza non prova l’esistenza di un endpoint WebSocket ZComm.

## 11. Sicurezza e minacce

Il modello di minaccia considera input utente, manifest, frame CB, endpoint remoti e dati persistiti come non affidabili fino a validazione.

| Minaccia | Controllo obbligatorio |
|---|---|
| Shell remota | Nessuna API shell; parser allowlist; test di rifiuto |
| Socket arbitrari | Endpoint solo da configurazione; CB solo `wss://` |
| Relay malevolo | Schema frame, limiti, capability e stato visibile |
| Nodo falso | Verifica `schema`, `nodeId`, `nodeName` e `ONLINE` |
| Perdita di rete | Coda locale persistente e stato `OFFLINE` |
| Credential leakage | Nessun token o segreto nel client, README o commit |
| Confusione preview/prova | Badge e namespace distinti |
| Traversal o filesystem | Nessuna capacità filesystem remota |
| Denial of service applicativo | Timeout probe, corpi bounded e frame limitati |

La sicurezza non deve essere dichiarata sulla base di una schermata verde. Deve essere dimostrata dal percorso codice, dal contratto, dai test e dalla configurazione effettiva.

## 12. Receipts e ZTRACE

Una receipt locale contiene almeno identificativo, operazione, stato e dettaglio. Le operazioni previste includono `zcomm.zlang`, `zcomm.message.queue`, `zcomm.sync`, `zcomm.antenna.status`, `zcomm.cb.connect`, `zcomm.cb.send` e `meccanincame.pair.local`.

`ZTRACE` è un fingerprint deterministico di orientamento della sessione. Non è una firma crittografica, non è una credenziale, non è un audit server-side e non prova l’identità del nodo.

## 13. Configurazione ufficiale

| Variabile | Uso | Default |
|---|---|---|
| `EXPO_PUBLIC_ZCOMM_SYNC_URL` | POST della coda ZComm | Non configurato |
| `EXPO_PUBLIC_ZCOMM_CB_WS_URL` | Relay CB realtime | Non configurato |
| `EXPO_PUBLIC_ZDOS_FIRST_NODE_URL` | Probe `GET /v1/status` | Non configurato |
| `ZCOMM_SYNC_URL` | Variabile Actions per la build | Vuota se assente |
| `ZCOMM_CB_WS_URL` | Variabile Actions per Pages/APK | Vuota se assente |
| `ZDOS_FIRST_NODE_URL` | Variabile Actions per Pages/APK | Vuota se assente |

Le variabili `EXPO_PUBLIC_*` possono entrare nel bundle client. Non devono contenere segreti, token privati o credenziali operative.

## 14. GitHub, branch e governance

Il branch `main` è protetto. Le modifiche devono passare da Pull Request e revisione. La PR corrente è:

[PR #11 — feat: add bounded realtime ZComm CB for Pages](https://github.com/high-cde/zdos-microcosm-beta/pull/11)

| Elemento | Stato rilevato |
|---|---|
| Branch di lavoro | `feat/zcomm-cb-pages` |
| Ultimo commit | `63c3310 docs: document cb pages and apk delivery` |
| PR | Aperta |
| Merge | Bloccato |
| Revisione | Richiesta |
| Push diretto su `main` | Rifiutato dalla protezione |

Il merge può avvenire soltanto dopo revisione e superamento dei controlli richiesti. Nessuna modifica deve aggirare la protezione con force push o riscrittura della storia.

## 15. GitHub Pages

Il workflow `.github/workflows/web-pages.yml` esegue installazione, type-check, test, export Expo web, upload dell’artifact e deploy Pages. La destinazione prevista è:

<https://high-cde.github.io/zdos-microcosm-beta/>

La pipeline può pubblicare il codice UI anche quando il relay CB non è configurato. In quel caso il pulsante CB deve mostrare uno stato non connesso e non tentare un WebSocket.

La pubblicazione della branch `main` richiede il merge della PR. Una build manuale della branch di lavoro non equivale a una release ufficiale della Pages principale.

## 16. Android APK

Il workflow `.github/workflows/android-apk.yml` esegue type-check, test, prebuild Expo, compilazione Gradle release e upload dell’APK come artifact con retention di 14 giorni.

L’APK include il client CB e le policy locali. La build non deve contenere credenziali. Se `ZCOMM_CB_WS_URL` non è presente, l’APK rimane offline-first e il CB non apre connessioni.

L’artifact di una build di branch è un artefatto di verifica. Non deve essere chiamato release ufficiale finché il commit non è stato revisionato, fuso e identificato con versione e checksum.

## 17. Criteri di accettazione

Una modifica è accettabile soltanto quando tutte le condizioni applicabili sono vere:

1. Il codice compila con `pnpm check`.
2. I test applicabili passano con `pnpm test -- --run`.
3. Il diff non contiene whitespace error con `git diff --check`.
4. Ogni nuova capability è documentata.
5. Ogni endpoint remoto è esplicito e non contiene segreti.
6. Il comportamento offline è preservato.
7. Il comportamento deny-by-default è coperto da test.
8. La UI distingue connessione, configurazione assente, errore e rifiuto.
9. La PR rispetta la protezione di `main`.
10. Pages e APK pubblicati sono associati al commit corretto.
11. Un relay CB reale risponde con protocollo e limiti documentati.
12. Il First Node risponde con contratto `zdos-node-status/v1` verificabile.

## 18. Stato di completamento corrente

Alla data dello statuto, il codice locale e la branch di lavoro contengono:

| Voce | Stato |
|---|---|
| Runtime ZComm offline-first | Implementato |
| Probe First Node read-only | Implementato e configurabile |
| MECCANINCAME locale | Implementato |
| Link X-ZDOS.IT | Implementato |
| Client CB `wss://` | Implementato e testato |
| README | Aggiornato |
| Workflow Pages | Aggiornato |
| Workflow APK | Aggiornato |
| Type-check | Superato localmente |
| Test | 18 superati, 1 skipped previsto |
| PR GitHub | Aperta |
| Merge su `main` | Non completato |
| Relay VPS reale | Non verificato/configurato |
| Endpoint Pages pubblico CB | Non attestato come operativo |
| APK release ufficiale | Non attestato finché build e merge non sono completati |

La distinzione tra implementato e operativo è vincolante. Il client CB è implementato, ma la connessione reale richiede un relay `wss://` configurato. Pages e APK sono predisposti, ma la release ufficiale richiede il percorso GitHub protetto.

## 19. Procedura di attivazione del relay reale

Il proprietario dell’infrastruttura deve predisporre sulla VPS un relay WebSocket TLS con certificato valido. Il relay deve autenticare o autorizzare il canale secondo una policy separata, applicare rate limiting, limitare dimensione e frequenza dei frame, conservare audit secondo la policy vigente e rifiutare ogni tipo diverso da `zcomm.cb.message`.

Dopo il collaudo del relay, il proprietario deve impostare `ZCOMM_CB_WS_URL` nelle variabili Actions del repository. La build successiva deve essere verificata su browser e APK. L’attivazione non deve avvenire inserendo token privati in `EXPO_PUBLIC_*`.

## 20. Riferimenti

[1]: https://github.com/high-cde/zdos-microcosm-beta "Repository ZDOS Microcosm Beta"

[2]: https://github.com/high-cde/zdos-microcosm-beta/pull/11 "Pull Request ZComm CB Pages/APK"

[3]: https://high-cde.github.io/zdos-microcosm-beta/ "ZDOS Microcosm GitHub Pages"

[4]: https://x-zdos.it "ZDOS Evidence Ecosystem webapp"

[5]: https://apps.kde.org/kdeconnect/ "KDE Connect official application page"

[6]: https://github.com/high-cde/ZDOS "ZDOS repository"

[7]: https://github.com/high-cde/Zlang "Zlang repository"
