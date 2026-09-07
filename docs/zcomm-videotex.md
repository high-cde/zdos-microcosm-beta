# ZComm Z-Videotex

## Scopo

**ZComm Videotel**, o **Z-Videotex**, è il sottosistema nativo di ZDOS Microcosm dedicato a un’interfaccia testuale leggera, deterministica e vincolata da policy `DEFAULT-DENY`. Il modulo adatta il modello dei terminali Videotel storici al profilo Zlang by ZDOS senza trasformare l’app in una shell Android o in un agente remoto.

Il modulo è locale e read-only. L’unico nodo pubblico riconosciuto dall’app è `core-01`.

## Architettura

### Separazione firmware/runtime

Il contratto `videotex.zlang` descrive un firmware di bootstrap minimale. Le sue responsabilità sono limitate all’inizializzazione dell’interfaccia testuale, al rendering della griglia e alla validazione del flusso Zlang. Il client non esegue programmi Android, bytecode arbitrario o comandi remoti.

### Canale confinato

ZComm rappresenta un canale Z-Modem/V.23 emulato a livello di contratto. Questa versione non apre socket, non effettua connessioni di rete e non implementa un trasporto remoto. Ogni riga viene validata contro una allowlist deterministica.

Le operazioni ammesse sono:

| Operazione | Istruzione | Effetto |
|---|---|---|
| Stato | `status node.profile` | Legge il profilo pubblico `core-01` |
| Rendering | `emit ...` | Produce una riga sulla griglia locale |
| Indice | `storage.read ".videotex_index"` | Legge l’indice concettuale confinato del Videotel |
| Attestazione | `attest videotex.session.initialized` | Crea una ricevuta locale di sessione |

Comandi come `exec`, `shell`, `socket.open`, `POST`, SSH e qualunque istruzione non presente nell’allowlist vengono rifiutati.

### Griglia deterministica

Il rendering usa una matrice ispirata al CEPT di **40 colonne per 24 righe**. Le righe sono limitate a 40 caratteri tramite `isFixedGridLine`. La schermata iniziale contiene tre servizi:

| Codice | Servizio |
|---|---|
| `*01#` | ZDOS Status — nodo pubblico `core-01` |
| `*02#` | Zlang Runtime — profilo ZLB2 v2.5 |
| `*03#` | Evidence Chain Ledger — ricevute locali read-only |

La navigazione `*Pagina#` viene risolta localmente da `servicePageForCode`.

## Programma Zlang

Il sorgente canonico è [`zlang/videotex.zlang`](../zlang/videotex.zlang). La sequenza principale è:

```zlang
status node.profile
emit +----------------------------------------+
emit |         ZDOS VIDEOTEX v1.0             |
emit |      [01] ZDOS Status                  |
emit |      [02] Zlang Runtime                |
emit |      [03] Evidence Chain Ledger        |
emit +----------------------------------------+
emit Inserisci codice servizio (*Pagina#):
storage.read ".videotex_index"
attest videotex.session.initialized
```

Il parser e il contratto applicativo sono implementati in [`lib/zcomm-videotex.ts`](../lib/zcomm-videotex.ts). La superficie UI è disponibile come **ZComm Videotel** nella home dell’app, all’indice **07**.

## Evidence e attestazione

`attest videotex.session.initialized` non dichiara una firma esterna e non prova consenso distribuito. In questa release produce una ricevuta locale nella Evidence Chain della sessione. Il risultato è osservabile nell’interfaccia e non viene usato come credenziale.

## Confini di sicurezza

ZComm non conserva chiavi private, credenziali, hostname VPS o metadati del server dell’utente. Non espone filesystem, shell, SSH o comandi Zlang remoti. Il profilo pubblico `core-01` può essere osservato tramite Node Pulse, ma ZComm resta un renderer locale e non apre il canale di rete.

## Verifica

Il contratto è coperto da [`tests/zcomm-videotex.test.ts`](../tests/zcomm-videotex.test.ts). La suite verifica l’accettazione del programma Videotel, il rifiuto di comandi arbitrari, il limite della griglia 40×24 e la navigazione dei codici servizio.
