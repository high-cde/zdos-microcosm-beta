# Beta checklist

## Completato

| Area | Stato |
|---|---|
| Home minima | Menu con sole card `ZDOS` e `Zlang` |
| Interazione | Apertura e chiusura del profilo locale |
| Visual design | Palette dark cyan/lime/violet |
| Micro-immagini | ASCII colorato, senza asset esterni per le card |
| Sicurezza | Offline, default-deny, read-only, nessuna shell |
| Configurazione | Expo name, slug, package Android e portrait |
| Qualità | TypeScript e test demo eseguiti |
| Export | Bundle Android Expo generato in `dist-android-minimal/` |

## Beta corrente

La beta corrente è una console informativa locale. I badge `VERIFIED` identificano il profilo catalogato del progetto e non attestano un build, un boot o una compilazione eseguiti sul telefono.

## Mancanze per APK installabile

| Attività | Stato | Nota |
|---|---|---|
| Build Android nativa | Da fare | Serve EAS o Android SDK/Gradle configurato. |
| Signing e keystore | Da fare | Il keystore non deve essere committato. |
| Application ID definitivo | Da confermare | Verificare `android.package` prima della distribuzione. |
| Versioning beta | Da fare | Impostare version code e release channel. |
| Test su dispositivi reali | Da fare | Verificare layout, back gesture e installazione. |
| Checksum APK | Da fare | Pubblicare SHA-256 insieme all’APK. |

## Fuori scope intenzionale

Restano disabilitati terminale reale, shell Android, compilatore nativo Zlang, kernel ZDOS eseguibile, emulatori, ROM, socket, filesystem libero, account, backend e sincronizzazione automatica. La persistenza delle ricevute, l’import del manifest Lab e il collegamento read-only a SEC Portal sono estensioni future, non funzioni della beta minima.
