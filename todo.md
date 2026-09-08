# Project TODO

- [x] Recreate ZDOS Microcosm Beta Home / Microcosm screen
- [x] Add offline beta status markers and default-deny messaging
- [x] Implement local demo terminal with supported commands and explicit denials
- [x] Implement Zlang Playground with ZLB2 v2.5 validation demo
- [x] Implement ZRetro Studio with Meteor Patrol preview demo
- [x] Implement session Evidence Chain receipt list
- [x] Implement Security / Capabilities screen
- [x] Add one-handed portrait navigation and return-to-microcosm flow
- [x] Apply ZDOS retro-futuristic laboratory design tokens and typography
- [x] Configure Expo app metadata for ZDOS Microcosm Beta
- [x] Generate and install custom app icon assets
- [x] Add unit tests for demo commands, Zlang validation and receipt structure
- [x] Run TypeScript and Vitest checks
- [x] Define the Android release pipeline without committing generated native or bundle output

## Known beta limits

- [ ] Local receipts remain session state; ZComm message queue now persists with AsyncStorage
- [ ] No native Zlang compiler, Android shell, emulator, ROM or remote backend

## GitHub publication

- [x] Optimize generated icon assets for repository size limits
- [x] Create a private GitHub repository named `zdos-microcosm-beta`
- [x] Push the prepared source and tests to GitHub; keep Android outputs in CI artifacts/releases
- [x] Verify the remote repository contents and privacy setting

## Profile and private node extension

- [x] Inspect current connector and VPS-related configuration for a recognizable private ZDOS node
- [x] Define and document the ZDOS Microcosm profile boundaries before attaching external infrastructure
- [x] Add an explicit node status/profile surface to the app without exposing secrets
- [x] Add a documented advanced “magic” layer with deterministic local diagnostics and traceable receipts
- [ ] Attach the recognized private ZDOS node only after confirming its identity and supported access method
- [x] Test the extended profile and synchronize the changes to the private GitHub repository

## ZComm Videotel

- [x] Implementare il profilo locale `ZLB2 zcomm.local`
- [x] Implementare pagine CEPT 40×24, stanze, nickname e messaggi bounded
- [x] Aggiungere coda persistente offline con stato `PENDING`
- [x] Aggiungere sync HTTPS opzionale, allowlisted e fail-closed
- [x] Collegare esecuzioni e invii alla Evidence Chain tramite receipt `zcomm.*`
- [x] Aggiungere test per percorso valido, sintassi non supportata, `HALT` e coda offline
- [ ] Definire una revisione separata per eventuali integrazioni radio o di rete reali; nessuna è autorizzata nella beta attuale

## Coerenza repository

- [x] Allineare il comando `help` del terminale al catalogo corrente includendo `telecom`
- [x] Documentare la distinzione tra superfici implementate, simulate e roadmap
- [ ] Riattivare il test di logout quando il flusso auth sarà stabilizzato
