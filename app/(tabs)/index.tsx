import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import {
  computeZtrace,
  previewZretro,
  runTerminalCommand,
  validateZlang,
  type DemoResult,
  type Receipt,
  type ReceiptStatus,
} from "@/lib/zdos-demo";
import { PRIVATE_ZDOS_NODE, nodeBindingState } from "@/lib/zdos-node";
import { emptyMeccanincameState, MECCANINCAME_TEMPLATE, pairMeccanincameLocally, runMeccanincameZlang } from "@/lib/zdos-meccanincame";
import { loadZCommState, probeZCommAntenna, queueZCommMessage, runZcommZlang, syncZCommState, ZCommCbClient, zcommZlangTemplate, type ZCommAntenna, type ZCommCbStatus, type ZCommState } from "@/lib/zdos-zcomm";
import { appendRuntimeReceipt, createRuntimeState, loadRuntimeState, saveRuntimeState, type ZdosRuntimeState } from "@/lib/zdos-runtime";

type Surface = "home" | "terminal" | "zlang" | "zretro" | "telecom" | "meccanincame" | "monitor" | "evidence" | "security" | "profile";

type TerminalEntry = {
  id: string;
  command: string;
  output: string;
  status: ReceiptStatus;
};

type MenuCard = {
  id: Exclude<Surface, "home">;
  index: string;
  title: string;
  description: string;
  status: ReceiptStatus;
  accent: string;
};

const COLORS = {
  void: "#070A0F",
  panel: "#101820",
  panelSoft: "#0C131A",
  cyan: "#28E6F0",
  lime: "#B7FF2A",
  violet: "#8B5CF6",
  amber: "#F2C94C",
  red: "#FF5577",
  ink: "#EAF2F4",
  muted: "#8A9BA3",
  line: "#263842",
};

const MENU_CARDS: MenuCard[] = [
  {
    id: "terminal",
    index: "01",
    title: "Terminale locale",
    description: "Comandi demo, stato del microcosmo e rifiuti espliciti.",
    status: "READY",
    accent: COLORS.cyan,
  },
  {
    id: "zlang",
    index: "02",
    title: "Zlang Playground",
    description: "Valida un profilo ZLB2 v2.5 senza compilatore nativo.",
    status: "ACCEPTED",
    accent: COLORS.lime,
  },
  {
    id: "zretro",
    index: "03",
    title: "ZRetro Studio",
    description: "Prepara una preview IR per Meteor Patrol.",
    status: "VERIFIED",
    accent: COLORS.violet,
  },
  {
    id: "telecom",
    index: "07",
    title: "ZComm Videotel",
    description: "Messaggeria 40×24 Zlang con coda offline e sync HTTPS opzionale.",
    status: "READY",
    accent: COLORS.cyan,
  },
  {
    id: "meccanincame",
    index: "08",
    title: "MECCANINCAME",
    description: "Pairing locale in stile KDE Connect, solo Zlang by ZDOS.",
    status: "READY",
    accent: COLORS.violet,
  },
  {
    id: "monitor",
    index: "09",
    title: "ZRetro Chat Control",
    description: "Dashboard live read-only del traffico tra terminali zretro.chat.",
    status: "READY",
    accent: COLORS.lime,
  },
  {
    id: "evidence",
    index: "04",
    title: "Evidence Chain",
    description: "Consulta le ricevute generate durante la sessione.",
    status: "READY",
    accent: COLORS.amber,
  },
  {
    id: "security",
    index: "05",
    title: "Security",
    description: "Capability visibili con profilo DEFAULT-DENY.",
    status: "DENIED",
    accent: COLORS.red,
  },
  {
    id: "profile",
    index: "06",
    title: "ZDOS Profile",
    description: "Identità, policy attiva e binding del nodo privato.",
    status: "ROADMAP",
    accent: COLORS.cyan,
  },
];

const INITIAL_TERMINAL: TerminalEntry[] = [
  {
    id: "welcome",
    command: "system",
    output: "ZDOS Microcosm Beta\nDemo terminal ready. Type help for supported commands.",
    status: "READY",
  },
];

function statusColor(status: ReceiptStatus) {
  switch (status) {
    case "ACCEPTED":
    case "VERIFIED":
    case "READY":
      return COLORS.lime;
    case "ROADMAP":
      return COLORS.amber;
    case "DENIED":
      return COLORS.red;
    default:
      return COLORS.muted;
  }
}

function StatusBadge({ status }: { status: ReceiptStatus }) {
  return (
    <View style={[styles.statusBadge, { borderColor: statusColor(status) }]}>
      <View style={[styles.statusDot, { backgroundColor: statusColor(status) }]} />
      <Text style={[styles.statusText, { color: statusColor(status) }]}>{status}</Text>
    </View>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function HomeHeader({ receiptsCount }: { receiptsCount: number }) {
  return (
    <View>
      <View style={styles.topMetaRow}>
        <Text style={styles.microLabel}>ZDOS / 01</Text>
        <View style={styles.offlinePill}>
          <View style={styles.offlineDot} />
          <Text style={styles.offlineText}>OFFLINE BETA</Text>
        </View>
      </View>
      <Text style={styles.heroTitle}>ZDOS //</Text>
      <Text style={styles.heroTitleAccent}>MICROcosm</Text>
      <Text style={styles.heroSubtitle}>A small, controlled world for ZDOS experiments.</Text>
      <Pressable accessibilityRole="link" accessibilityLabel="Apri il canale WhatsApp La Nova Avon" onPress={() => void Linking.openURL("https://whatsapp.com/channel/0029Vb7akVkKAwEp2NjB0U0x")} style={({ pressed }) => [styles.partnerLink, pressed && styles.pressed]}>
        <Text style={styles.partnerLinkText}>In collaborazione con </Text><Text style={styles.partnerLinkName}>La Nova Avon ↗</Text>
      </Pressable>
      <Pressable accessibilityRole="link" accessibilityLabel="Apri la webapp x-zdos.it" onPress={() => void Linking.openURL("https://x-zdos.it")} style={({ pressed }) => [styles.webappLink, pressed && styles.pressed]}>
        <Text style={styles.webappLinkText}>APRI WEBAPP </Text><Text style={styles.webappLinkName}>X-ZDOS.IT ↗</Text>
      </Pressable>

      <View style={styles.postureCard}>
        <View style={styles.postureTopRow}>
          <View>
            <Text style={styles.microLabel}>SYSTEM POSTURE</Text>
            <Text style={styles.postureTitle}>READY</Text>
          </View>
          <View style={styles.readyRing}>
            <View style={styles.readyRingInner} />
          </View>
        </View>
        <View style={styles.postureRule} />
        <View style={styles.markerRow}>
          <View style={styles.marker}>
            <Text style={styles.markerValue}>LOCAL</Text>
            <Text style={styles.markerCaption}>SESSION</Text>
          </View>
          <View style={styles.marker}>
            <Text style={styles.markerValue}>DENIED</Text>
            <Text style={styles.markerCaption}>NETWORK</Text>
          </View>
          <View style={styles.marker}>
            <Text style={styles.markerValue}>LOCAL</Text>
            <Text style={styles.markerCaption}>QUEUE</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeadingRow}>
        <SectionLabel>MICROCOSM SURFACES</SectionLabel>
        <Text style={styles.sectionCount}>{String(MENU_CARDS.length).padStart(2, "0")}</Text>
      </View>
      <Text style={styles.sectionIntro}>
        Choose a local surface. Every action is observable, bounded and receipt-linked.
      </Text>
      <View style={styles.sessionStrip}>
        <Text style={styles.sessionStripText}>SESSION RECEIPTS</Text>
        <Text style={styles.sessionStripValue}>{String(receiptsCount).padStart(2, "0")}</Text>
      </View>
    </View>
  );
}

function SurfaceHeader({ title, eyebrow, onBack }: { title: string; eyebrow: string; onBack: () => void }) {
  return (
    <View style={styles.surfaceHeader}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Torna al microcosmo"
        onPress={onBack}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Text style={styles.backArrow}>‹</Text>
        <Text style={styles.backText}>MICROCOSM</Text>
      </Pressable>
      <Text style={styles.surfaceEyebrow}>{eyebrow}</Text>
      <Text style={styles.surfaceTitle}>{title}</Text>
    </View>
  );
}

function PrimaryButton({ label, onPress, accent = COLORS.lime }: { label: string; onPress: () => void; accent?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.primaryButton, { backgroundColor: accent }, pressed && styles.primaryButtonPressed]}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
      <Text style={styles.primaryButtonArrow}>↗</Text>
    </Pressable>
  );
}

function ReceiptCard({ receipt }: { receipt: Receipt }) {
  return (
    <View style={styles.receiptCard}>
      <View style={styles.receiptTopRow}>
        <Text style={styles.receiptOperation}>{receipt.operation}</Text>
        <StatusBadge status={receipt.status} />
      </View>
      <Text style={styles.receiptDetail}>{receipt.detail}</Text>
      <Text style={styles.receiptLink}>local receipt · hash linked</Text>
    </View>
  );
}

function TerminalSurface({ onBack, onReceipt }: { onBack: () => void; onReceipt: (receipt: Omit<Receipt, "id">) => void }) {
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<TerminalEntry[]>(INITIAL_TERMINAL);

  const submitCommand = () => {
    const trimmed = command.trim();
    if (!trimmed) return;
    const result = runTerminalCommand(trimmed);
    setHistory((previous) => [
      ...previous,
      { id: `${trimmed}-${Date.now()}`, command: trimmed, output: result.output, status: result.status },
    ]);
    onReceipt({ operation: `terminal.${trimmed.toLowerCase()}`, status: result.status, detail: result.detail });
    setCommand("");
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-background">
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.surfaceContent} keyboardShouldPersistTaps="handled">
          <SurfaceHeader title="LOCAL TERMINAL" eyebrow="SURFACE / 01 · PREVIEW ONLY" onBack={onBack} />
          <View style={styles.terminalFrame}>
            <View style={styles.terminalTopBar}>
              <View style={styles.terminalLights}>
                <View style={[styles.terminalLight, { backgroundColor: COLORS.red }]} />
                <View style={[styles.terminalLight, { backgroundColor: COLORS.amber }]} />
                <View style={[styles.terminalLight, { backgroundColor: COLORS.lime }]} />
              </View>
              <Text style={styles.terminalTopText}>LOCAL / NO SOCKETS</Text>
            </View>
            <View style={styles.terminalOutput}>
              {history.map((entry) => (
                <View key={entry.id} style={styles.terminalEntry}>
                  {entry.command !== "system" ? <Text style={styles.terminalPrompt}>x@microcosm:~$ {entry.command}</Text> : null}
                  <Text style={styles.terminalText}>{entry.output}</Text>
                  <Text style={[styles.terminalStatus, { color: statusColor(entry.status) }]}>{entry.status}</Text>
                </View>
              ))}
              <View style={styles.terminalInputRow}>
                <Text style={styles.terminalPrompt}>x@microcosm:~$</Text>
                <TextInput
                  accessibilityLabel="Comando terminale demo"
                  value={command}
                  onChangeText={setCommand}
                  onSubmitEditing={submitCommand}
                  placeholder="type a demo command"
                  placeholderTextColor="#5D737C"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  style={styles.terminalInput}
                />
              </View>
            </View>
          </View>
          <View style={styles.commandHintCard}>
            <Text style={styles.microLabel}>SUPPORTED COMMANDS</Text>
            <Text style={styles.commandHint}>help  ·  status  ·  zlang  ·  zretro  ·  evidence  ·  deny</Text>
          </View>
          <Text style={styles.disclaimer}>This is a bounded demo terminal. Android shell, filesystem and network execution are not available.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function ZlangSurface({ onBack, onReceipt }: { onBack: () => void; onReceipt: (receipt: Omit<Receipt, "id">) => void }) {
  const [code, setCode] = useState("emit ZDOS risponde");
  const [result, setResult] = useState<DemoResult | null>(null);

  const validate = () => {
    const nextResult = validateZlang(code);
    setResult(nextResult);
    onReceipt({ operation: "zlang.validate", status: nextResult.status, detail: nextResult.detail });
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.surfaceContent} keyboardShouldPersistTaps="handled">
        <SurfaceHeader title="ZLANG PLAYGROUND" eyebrow="SURFACE / 02 · ZLB2 v2.5" onBack={onBack} />
        <View style={[styles.editorCard, { borderColor: COLORS.lime }]}>
          <View style={styles.editorHeader}>
            <Text style={styles.microLabel}>SOURCE / ZLANG</Text>
            <Text style={[styles.editorTag, { color: COLORS.lime }]}>EDITABLE</Text>
          </View>
          <TextInput
            accessibilityLabel="Editor codice Zlang"
            value={code}
            onChangeText={setCode}
            multiline
            textAlignVertical="top"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.codeEditor}
            selectionColor={COLORS.lime}
          />
          <Text style={styles.lineNumber}>01</Text>
        </View>
        <PrimaryButton label="VALIDATE ZLB2 v2.5" onPress={validate} accent={COLORS.lime} />
        <View style={styles.contractCard}>
          <SectionLabel>CONCEPTUAL CONTRACT</SectionLabel>
          <View style={styles.contractRow}>
            {[
              ["01", "Magic"],
              ["02", "Version"],
              ["03", "Opcode"],
              ["04", "Length"],
              ["05", "HALT"],
            ].map(([number, label]) => (
              <View key={number} style={styles.contractItem}>
                <Text style={styles.contractNumber}>{number}</Text>
                <Text style={styles.contractLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>
        {result ? (
          <View style={[styles.resultCard, { borderColor: statusColor(result.status) }]}>
            <View style={styles.resultTopRow}>
              <Text style={styles.resultTitle}>VALIDATION RESULT</Text>
              <StatusBadge status={result.status} />
            </View>
            <Text style={styles.resultOutput}>{result.output}</Text>
            <Text style={styles.resultDetail}>{result.detail}</Text>
            <Text style={styles.receiptLink}>local receipt · hash linked</Text>
          </View>
        ) : (
          <View style={styles.emptyResultCard}>
            <Text style={styles.microLabel}>AWAITING INPUT</Text>
            <Text style={styles.emptyResultText}>Run the validator to create an ACCEPTED or DENIED receipt.</Text>
          </View>
        )}
        <Text style={styles.disclaimer}>No native compiler runs inside the APK in this beta. Validation is a local profile demonstration.</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

function TelecomSurface({ onBack, onReceipt }: { onBack: () => void; onReceipt: (receipt: Omit<Receipt, "id">) => void }) {
  const [source, setSource] = useState(zcommZlangTemplate());
  const [result, setResult] = useState<ReturnType<typeof runZcommZlang> | null>(null);
  const [state, setState] = useState<ZCommState | null>(null);
  const [body, setBody] = useState("");
  const [nick, setNick] = useState("VISITOR");
  const [syncDetail, setSyncDetail] = useState("local queue loading …");
  const [roomId, setRoomId] = useState("piazza");
  const [antenna, setAntenna] = useState<ZCommAntenna | null>(null);
  const [cbStatus, setCbStatus] = useState<ZCommCbStatus>("DISCONNECTED");
  const cbEndpoint = process.env.EXPO_PUBLIC_ZCOMM_CB_WS_URL ?? "";
  const cbClient = useRef<ZCommCbClient | null>(null);

  useEffect(() => { void loadZCommState().then(setState); }, []);
  useEffect(() => () => { cbClient.current?.close(); }, []);

  const execute = () => {
    const nextResult = runZcommZlang(source);
    setResult(nextResult);
    onReceipt({ operation: "zcomm.zlang", status: nextResult.status, detail: nextResult.detail });
  };

  const sendMessage = async () => { if (!state) return; const next = await queueZCommMessage(state, roomId, nick, body); const sent = cbClient.current?.send({ roomId, nick, body }) ?? false; setState(next); setBody(""); setSyncDetail(sent ? "CB frame sent · local receipt retained" : "queued locally · safe to send when online"); onReceipt({ operation: sent ? "zcomm.cb.send" : "zcomm.message.queue", status: "ACCEPTED", detail: sent ? "bounded message sent over CB" : "message persisted in offline queue" }); };
  const sync = async () => { if (!state) return; const next = await syncZCommState(state, process.env.EXPO_PUBLIC_ZCOMM_SYNC_URL); setState(next.state); setSyncDetail(next.detail); onReceipt({ operation: "zcomm.sync", status: next.state.lastSync ? "ACCEPTED" : "READY", detail: next.detail }); };
  const checkAntenna = async () => { const next = await probeZCommAntenna(process.env.EXPO_PUBLIC_ZDOS_FIRST_NODE_URL); setAntenna(next); onReceipt({ operation: "zcomm.antenna.status", status: next.status === "CONNECTED" ? "ACCEPTED" : next.status === "DENIED" ? "DENIED" : "READY", detail: next.detail }); };
  const toggleCb = () => {
    if (cbClient.current?.status === "CONNECTED" || cbClient.current?.status === "CONNECTING") { cbClient.current.close(setCbStatus); return; }
    const client = new ZCommCbClient(); cbClient.current = client;
    client.connect(cbEndpoint, (event) => { if (!state || !state.rooms.some((room) => room.id === event.roomId)) return; setState((current) => current ? { ...current, messages: [...current.messages, { id: `cb-${event.createdAt}-${event.nick}`, roomId: event.roomId, nick: event.nick, body: event.body, createdAt: event.createdAt }] } : current); }, setCbStatus);
    onReceipt({ operation: "zcomm.cb.connect", status: cbEndpoint.startsWith("wss://") ? "READY" : "DENIED", detail: cbEndpoint.startsWith("wss://") ? "CB connection requested" : "wss:// endpoint not configured" });
  };
  const activeMessages = state?.messages.filter((message) => message.roomId === roomId).slice(-8) ?? [];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.telecomFlex}>
      <ScrollView contentContainerStyle={styles.surfaceContent} keyboardShouldPersistTaps="handled">
        <SurfaceHeader title="ZCOMM / VIDEOTEL" eyebrow="ZLANG COMMUNITY · LOCAL-FIRST" onBack={onBack} />
        <View style={styles.telecomHero}>
          <View style={styles.telecomHeroTop}>
            <View>
              <Text style={styles.microLabel}>TELECOMMUNICATIONS PROFILE</Text>
              <Text style={styles.telecomTitle}>MESSAGGERIA 40×24</Text>
            </View>
            <StatusBadge status="READY" />
          </View>
          <Text style={styles.telecomDescription}>
            Una comunità testuale in stile Videotel: pagine, nickname e messaggi persistono offline e si sincronizzano solo verso un endpoint HTTPS configurato.
          </Text>
          <View style={styles.telecomGrid}>
            <View style={styles.telecomGridItem}><Text style={styles.telecomGridValue}>LOCAL</Text><Text style={styles.telecomGridLabel}>LINK</Text></View>
            <View style={styles.telecomGridItem}><Text style={styles.telecomGridValue}>40×24</Text><Text style={styles.telecomGridLabel}>SCREEN</Text></View>
            <View style={styles.telecomGridItem}><Text style={styles.telecomGridValue}>{state?.pending.length ?? 0}</Text><Text style={styles.telecomGridLabel}>OFFLINE QUEUE</Text></View>
          </View>
        </View>
        <View style={styles.antennaCard}>
          <View style={styles.resultHeaderRow}><Text style={styles.resultEyebrow}>FIRST NODE / ANTENNA</Text><StatusBadge status={antenna?.status === "CONNECTED" ? "ACCEPTED" : antenna?.status === "DENIED" ? "DENIED" : "READY"} /></View>
          <Text style={styles.antennaTitle}>{antenna?.nodeName ?? "zdos-first-node.service"}</Text>
          <Text style={styles.antennaDetail}>{antenna?.detail ?? "Non configurata · il nodo VPS non viene contattato automaticamente."}</Text>
          <Pressable onPress={checkAntenna} style={styles.antennaButton}><Text style={styles.antennaButtonText}>VERIFICA ANTENNA READ-ONLY</Text></Pressable>
        </View>
        <View style={styles.cbCard}>
          <View style={styles.resultHeaderRow}><Text style={styles.resultEyebrow}>CB / ZCOMM REALTIME</Text><StatusBadge status={cbStatus === "CONNECTED" ? "ACCEPTED" : cbStatus === "DENIED" || cbStatus === "ERROR" ? "DENIED" : "READY"} /></View>
          <Text style={styles.cbDetail}>{cbStatus === "CONNECTED" ? "CB online · frames ZComm bounded" : "Connessione reale disponibile solo con relay wss:// esplicito."}</Text>
          <Pressable onPress={toggleCb} style={styles.cbButton}><Text style={styles.cbButtonText}>{cbStatus === "CONNECTED" || cbStatus === "CONNECTING" ? "DISCONNECT CB" : "CONNECT CB"}</Text></Pressable>
          <Text style={styles.cbPolicy}>Policy: TLS WebSocket only · no shell · no arbitrary sockets · max 240 chars</Text>
        </View>
        <Text style={styles.inputLabel}>PAGES / MESSAGGERIE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomScroller}>
          {(state?.rooms ?? []).map((room) => <Pressable key={room.id} onPress={() => { setRoomId(room.id); setState(state ? { ...state, activePage: room.page } : state); }} style={[styles.roomChip, room.id === roomId && styles.roomChipActive]}><Text style={styles.roomPage}>*{room.page}#</Text><Text style={styles.roomTitle}>{room.title}</Text></Pressable>)}
        </ScrollView>
        <View style={styles.chatCard}>
          <Text style={styles.chatHeader}>{state?.rooms.find((room) => room.id === roomId)?.description ?? "Caricamento pagina…"}</Text>
          {activeMessages.map((message) => <View key={message.id} style={styles.messageRow}><Text style={styles.messageNick}>{message.nick}{message.pending ? " · PENDING" : ""}</Text><Text style={styles.messageBody}>{message.body}</Text></View>)}
          <TextInput value={nick} onChangeText={setNick} autoCapitalize="characters" placeholder="NICKNAME" placeholderTextColor={COLORS.muted} style={styles.nickInput} />
          <TextInput value={body} onChangeText={setBody} placeholder="Scrivi un messaggio…" placeholderTextColor={COLORS.muted} maxLength={240} style={styles.messageInput} />
          <Pressable onPress={sendMessage} style={styles.messageButton}><Text style={styles.telecomButtonText}>ACCODA MESSAGGIO OFFLINE</Text></Pressable>
          <Pressable onPress={sync} style={styles.syncButton}><Text style={styles.syncButtonText}>SYNC HTTPS ALLOWLISTED</Text><Text style={styles.syncDetail}>{syncDetail}</Text></Pressable>
        </View>
        <Text style={styles.inputLabel}>ZLANG TELECOM PROGRAM</Text>
        <TextInput
          multiline
          value={source}
          onChangeText={setSource}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          style={styles.telecomCodeInput}
        />
        <Pressable onPress={execute} style={({ pressed }) => [styles.telecomButton, pressed && styles.telecomButtonPressed]}>
          <Text style={styles.telecomButtonText}>RUN ZCOMM PROFILE</Text>
          <Text style={styles.telecomButtonArrow}>↗</Text>
        </Pressable>
        {result ? (
          <View style={styles.telecomResultCard}>
            <View style={styles.resultHeaderRow}><Text style={styles.resultEyebrow}>ZCOMM RECEIPT</Text><StatusBadge status={result.status} /></View>
            <Text selectable style={styles.telecomOutput}>{result.output}</Text>
            <Text style={styles.receiptLink}>local receipt · no network operation attempted</Text>
          </View>
        ) : (
          <View style={styles.telecomNote}><Text style={styles.telecomNoteText}>Supported Zlang: status · page.list · room.list · message.queue · sync status · tx deny · halt</Text></View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function MeccanincameSurface({ onBack, onReceipt }: { onBack: () => void; onReceipt: (receipt: Omit<Receipt, "id">) => void }) {
  const [state, setState] = useState(emptyMeccanincameState());
  const [peer, setPeer] = useState("ZDOS-DESKTOP");
  const [result, setResult] = useState<ReturnType<typeof runMeccanincameZlang> | null>(null);
  const pair = () => { const next = pairMeccanincameLocally(state, peer); setState(next); onReceipt({ operation: "meccanincame.pair.local", status: "ACCEPTED", detail: `local peer paired · ${next.peerName}` }); };
  const execute = () => { const next = runMeccanincameZlang(MECCANINCAME_TEMPLATE); setResult(next); onReceipt({ operation: "meccanincame.zlang", status: next.status, detail: next.detail }); };
  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.surfaceContent} keyboardShouldPersistTaps="handled">
        <SurfaceHeader title="MECCANINCAME" eyebrow="SURFACE / 08 · LOCAL PAIRING" onBack={onBack} />
        <View style={styles.meccanincameHero}>
          <View style={styles.resultHeaderRow}><Text style={styles.resultEyebrow}>ZLANG BY ZDOS</Text><StatusBadge status={state.status === "PAIRED_LOCAL" ? "ACCEPTED" : "READY"} /></View>
          <Text style={styles.meccanincameTitle}>KDE CONNECT, SANS EXTERNALS</Text>
          <Text style={styles.meccanincameDescription}>Collegamento tra dispositivi nello stesso profilo locale. Nessuna shell, nessun socket generico, nessun account o connessione esterna.</Text>
          <View style={styles.meccanincameGrid}><Text style={styles.meccanincameValue}>{state.peerName ?? "—"}</Text><Text style={styles.meccanincameLabel}>LOCAL PEER</Text><Text style={styles.meccanincameValue}>DENIED</Text><Text style={styles.meccanincameLabel}>NETWORK / SHELL</Text></View>
        </View>
        <Text style={styles.inputLabel}>LOCAL PEER NAME</Text>
        <TextInput value={peer} onChangeText={setPeer} autoCapitalize="characters" maxLength={32} style={styles.meccanincameInput} />
        <Pressable onPress={pair} style={styles.meccanincameButton}><Text style={styles.meccanincameButtonText}>PAIR LOCAL DEVICE</Text></Pressable>
        <Pressable onPress={execute} style={styles.telecomButton}><Text style={styles.telecomButtonText}>RUN MECCANINCAME ZLANG</Text><Text style={styles.telecomButtonArrow}>↗</Text></Pressable>
        {result ? <View style={styles.telecomResultCard}><View style={styles.resultHeaderRow}><Text style={styles.resultEyebrow}>LOCAL RECEIPT</Text><StatusBadge status={result.status} /></View><Text selectable style={styles.telecomOutput}>{result.output}</Text></View> : <View style={styles.telecomNote}><Text style={styles.telecomNoteText}>Capability allowlist: device.status · pair.local · network DENIED · shell DENIED</Text></View>}
      </ScrollView>
    </ScreenContainer>
  );
}

function ChatControlSurface({ onBack }: { onBack: () => void }) {
  const [state, setState] = useState<ZCommState | null>(null);
  const [lastUpdate, setLastUpdate] = useState("—");
  useEffect(() => {
    let mounted = true;
    const refresh = async () => { const next = await loadZCommState(); if (mounted) { setState(next); setLastUpdate(new Date().toLocaleTimeString()); } };
    void refresh();
    const timer = setInterval(() => { void refresh(); }, 1000);
    return () => { mounted = false; clearInterval(timer); };
  }, []);
  const messages = state?.messages.slice().reverse() ?? [];
  const nodes = Array.from(new Set(messages.map((message) => message.nick))).sort();
  const chatMessages = messages.filter((message) => message.roomId === "piazza").slice(0, 20);
  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.surfaceContent}>
        <SurfaceHeader title="ZRETRO CHAT CONTROL" eyebrow="SURFACE / 09 · LIVE LOCAL OBSERVER" onBack={onBack} />
        <View style={[styles.monitorHero, { borderColor: COLORS.lime }]}>
          <View style={styles.resultHeaderRow}><Text style={styles.resultEyebrow}>ZRETRO.CHAT / READ-ONLY</Text><StatusBadge status="READY" /></View>
          <Text style={styles.monitorTitle}>TRAFFIC MATRIX</Text>
          <Text style={styles.monitorDescription}>Aggiornamento locale ogni secondo. Nessun invio, nessuna mutazione e nessuna rete implicita.</Text>
          <View style={styles.monitorGrid}>
            <View style={styles.telecomGridItem}><Text style={styles.telecomGridValue}>{nodes.length}</Text><Text style={styles.telecomGridLabel}>NODES</Text></View>
            <View style={styles.telecomGridItem}><Text style={styles.telecomGridValue}>{messages.length}</Text><Text style={styles.telecomGridLabel}>EVENTS</Text></View>
            <View style={styles.telecomGridItem}><Text style={styles.telecomGridValue}>{state?.pending.length ?? 0}</Text><Text style={styles.telecomGridLabel}>PENDING</Text></View>
          </View>
        </View>
        <Text style={styles.monitorUpdated}>LAST POLL · {lastUpdate}</Text>
        <Text style={styles.inputLabel}>OBSERVED TERMINALS</Text>
        <View style={styles.nodeMatrix}>{nodes.length ? nodes.map((node) => <View key={node} style={styles.nodeChip}><View style={styles.nodePulse} /><Text style={styles.nodeChipText}>{node}</Text><Text style={styles.nodeState}>LOCAL</Text></View>) : <Text style={styles.telecomNoteText}>Nessun terminale osservato.</Text>}</View>
        <Text style={styles.inputLabel}>LIVE MESSAGE FEED · PIAZZA</Text>
        <View style={styles.monitorFeed}>{chatMessages.length ? chatMessages.map((message) => <View key={message.id} style={styles.monitorMessage}><Text style={styles.monitorMeta}>{message.nick} · {message.pending ? "PENDING" : "STORED"}</Text><Text style={styles.monitorBody}>{message.body}</Text></View>) : <Text style={styles.telecomNoteText}>Nessun messaggio zretro.chat disponibile.</Text>}</View>
      </ScrollView>
    </ScreenContainer>
  );
}

function ZretroSurface({ onBack, onReceipt }: { onBack: () => void; onReceipt: (receipt: Omit<Receipt, "id">) => void }) {
  const [manifest, setManifest] = useState("project Meteor Patrol\nscreen 320 200\nscene courtyard");
  const [previewed, setPreviewed] = useState(false);

  const preview = () => {
    const result = previewZretro(manifest);
    setPreviewed(true);
    onReceipt({ operation: "zretro.preview", status: result.status, detail: result.detail });
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.surfaceContent} keyboardShouldPersistTaps="handled">
        <SurfaceHeader title="ZRETRO STUDIO" eyebrow="SURFACE / 03 · IR PREVIEW" onBack={onBack} />
        <View style={[styles.editorCard, { borderColor: COLORS.violet }]}>
          <View style={styles.editorHeader}>
            <Text style={styles.microLabel}>MANIFEST / METEOR PATROL</Text>
            <Text style={[styles.editorTag, { color: COLORS.violet }]}>TEXT IR</Text>
          </View>
          <TextInput
            accessibilityLabel="Editor manifest Meteor Patrol"
            value={manifest}
            onChangeText={setManifest}
            multiline
            textAlignVertical="top"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.codeEditor}
            selectionColor={COLORS.violet}
          />
        </View>
        <PrimaryButton label="PREVIEW METEOR PATROL" onPress={preview} accent={COLORS.violet} />
        {previewed ? (
          <View style={[styles.resultCard, { borderColor: COLORS.lime }]}>
            <View style={styles.resultTopRow}>
              <Text style={styles.resultTitle}>PREVIEW RESULT</Text>
              <StatusBadge status="VERIFIED" />
            </View>
            <Text style={styles.resultOutput}>IR READY</Text>
            <Text style={styles.resultDetail}>manifest prepared</Text>
            <Text style={styles.receiptLink}>local receipt · hash linked</Text>
          </View>
        ) : null}
        <View style={styles.targetCard}>
          <SectionLabel>DECLARED TARGETS</SectionLabel>
          <View style={styles.targetRow}>
            <View style={styles.targetChip}><Text style={styles.targetChipText}>C64</Text></View>
            <View style={styles.targetChip}><Text style={styles.targetChipText}>ATARI 8-BIT</Text></View>
            <View style={styles.targetChip}><Text style={styles.targetChipText}>AMIGA</Text></View>
          </View>
          <View style={styles.roadmapNote}>
            <StatusBadge status="ROADMAP" />
            <Text style={styles.roadmapText}>Native backends, emulators and ROM execution are outside this beta.</Text>
          </View>
        </View>
        <Text style={styles.disclaimer}>The preview prepares a text manifest only. It does not launch an emulator or produce a native retro binary.</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

function EvidenceSurface({ onBack, receipts }: { onBack: () => void; receipts: Receipt[] }) {
  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-background">
      <FlatList
        data={receipts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.surfaceContent}
        ListHeaderComponent={
          <View>
            <SurfaceHeader title="EVIDENCE CHAIN" eyebrow="SURFACE / 04 · SESSION RECEIPTS" onBack={onBack} />
            <View style={styles.evidenceSummary}>
              <View>
                <Text style={styles.microLabel}>LOCAL RECEIPTS</Text>
                <Text style={styles.evidenceCount}>{String(receipts.length).padStart(2, "0")}</Text>
              </View>
              <Text style={styles.evidenceSummaryText}>hash linked{`\n`}session state</Text>
            </View>
            <Text style={styles.sectionIntro}>Operations are listed in session order. This chain is demonstrative, not persistent cryptography.</Text>
          </View>
        }
        renderItem={({ item }) => <ReceiptCard receipt={item} />}
        ItemSeparatorComponent={() => <View style={styles.listGap} />}
        ListFooterComponent={<Text style={styles.disclaimer}>Receipts live in React state for this session. AsyncStorage persistence is a future extension.</Text>}
      />
    </ScreenContainer>
  );
}

function SecuritySurface({ onBack }: { onBack: () => void }) {
  const capabilities = useMemo(
    () => [
      { key: "NETWORK", value: "DENIED", detail: "No automatic requests or sockets.", color: COLORS.red },
      { key: "STORAGE", value: "./workspace only", detail: "Boundary declared; no free filesystem access.", color: COLORS.cyan },
      { key: "EXECUTION", value: "PREVIEW ONLY", detail: "No shell, binaries or Android process launch.", color: COLORS.amber },
      { key: "IDENTITY", value: "guest", detail: "No account, login or cloud session.", color: COLORS.violet },
    ],
    [],
  );

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.surfaceContent}>
        <SurfaceHeader title="SECURITY" eyebrow="SURFACE / 05 · CAPABILITIES" onBack={onBack} />
        <View style={styles.securityHero}>
          <Text style={styles.microLabel}>ACTIVE PROFILE</Text>
          <Text style={styles.securityProfile}>DEFAULT-DENY</Text>
          <Text style={styles.securityDescription}>Anything not explicitly allowed is refused or marked as roadmap.</Text>
        </View>
        <SectionLabel>CAPABILITY MATRIX</SectionLabel>
        <View style={styles.capabilityCard}>
          {capabilities.map((capability, index) => (
            <View key={capability.key} style={[styles.capabilityRow, index < capabilities.length - 1 && styles.capabilityDivider]}>
              <View style={[styles.capabilityMarker, { backgroundColor: capability.color }]} />
              <View style={styles.capabilityCopy}>
                <Text style={styles.capabilityKey}>{capability.key}</Text>
                <Text style={[styles.capabilityValue, { color: capability.color }]}>{capability.value}</Text>
                <Text style={styles.capabilityDetail}>{capability.detail}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.boundaryCard}>
          <Text style={styles.microLabel}>BETA BOUNDARIES</Text>
          <Text style={styles.boundaryText}>No shell Android reale. No rete automatica. No accesso libero al filesystem. No database remoto.</Text>
          <View style={styles.boundaryRule} />
          <Text style={styles.boundaryFoot}>Controlled by design · observable by default</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function ProfileSurface({ onBack, receiptCount }: { onBack: () => void; receiptCount: number }) {
  const ztrace = computeZtrace("profile", receiptCount);
  const node = PRIVATE_ZDOS_NODE;
  const nodeIdentity = nodeBindingState(node);

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.surfaceContent}>
        <SurfaceHeader title="ZDOS PROFILE" eyebrow="CONTROL PLANE · TRANSPARENT BY DESIGN" onBack={onBack} />
        <View style={styles.profileHero}>
          <Text style={styles.microLabel}>PROFILE ID</Text>
          <Text style={styles.profileId}>zdos.microcosm.beta</Text>
          <View style={styles.profileRule} />
          <View style={styles.profilePair}>
            <View style={styles.profilePairBlock}>
              <Text style={styles.microLabel}>POSTURE</Text>
              <Text style={[styles.profilePairValue, { color: COLORS.lime }]}>DEFAULT-DENY</Text>
            </View>
            <View style={styles.profilePairBlock}>
              <Text style={styles.microLabel}>IDENTITY</Text>
              <Text style={[styles.profilePairValue, { color: COLORS.violet }]}>guest</Text>
            </View>
          </View>
        </View>
        <View style={styles.nodeCard}>
          <View style={styles.nodeCardTop}>
            <View>
              <Text style={styles.microLabel}>LOCAL APPLICATION PROFILE</Text>
              <Text style={styles.nodeStatus}>{nodeIdentity} · UNLINKED</Text>
            </View>
            <StatusBadge status={nodeIdentity === "IDENTIFIED" ? "VERIFIED" : "ROADMAP"} />
          </View>
          <Text style={styles.nodeText}>This profile is local-only. No server address, infrastructure identity or remote transport is stored in the application.</Text>
          <View style={styles.nodeChecklist}>
            <Text style={styles.nodeChecklistItem}>— node name: {node.nodeName}</Text>
            <Text style={styles.nodeChecklistItem}>— node id: {node.nodeId}</Text>
            <Text style={styles.nodeChecklistItem}>— transport: {node.transport}</Text>
            <Text style={styles.nodeChecklistItem}>— remote execution: denied</Text>
          </View>
        </View>
        <View style={styles.ztraceCard}>
          <View style={styles.ztraceTopRow}>
            <Text style={styles.microLabel}>ZTRACE / SESSION SIGNATURE</Text>
            <Text style={styles.ztraceGlyph}>✦</Text>
          </View>
          <Text style={styles.ztraceValue}>{ztrace}</Text>
          <Text style={styles.ztraceDescription}>Deterministic local fingerprint of profile, policy, surface and receipt count. Informative only; never a secret or credential.</Text>
        </View>
        <View style={styles.profileGrid}>
          <View style={styles.profileGridItem}><Text style={styles.profileGridValue}>{String(receiptCount).padStart(2, "0")}</Text><Text style={styles.profileGridLabel}>RECEIPTS</Text></View>
          <View style={styles.profileGridItem}><Text style={styles.profileGridValue}>06</Text><Text style={styles.profileGridLabel}>SURFACES</Text></View>
          <View style={styles.profileGridItem}><Text style={styles.profileGridValue}>0</Text><Text style={styles.profileGridLabel}>NETWORK</Text></View>
        </View>
        <Text style={styles.disclaimer}>The profile never enables hidden privileges. A future node bridge must be explicit, authenticated, read-only by default and independently disableable.</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

export default function MicrocosmScreen() {
  const [surface, setSurface] = useState<Surface>("home");
  const [runtime, setRuntime] = useState<ZdosRuntimeState>(() => createRuntimeState());

  useEffect(() => {
    void loadRuntimeState().then(setRuntime);
  }, []);

  const addReceipt = (receipt: Omit<Receipt, "id">) => {
    setRuntime((previous) => {
      const next = appendRuntimeReceipt(previous, receipt);
      void saveRuntimeState(next).catch(() => undefined);
      return next;
    });
  };

  const receipts = runtime.receipts;

  if (surface === "terminal") return <TerminalSurface onBack={() => setSurface("home")} onReceipt={addReceipt} />;
  if (surface === "zlang") return <ZlangSurface onBack={() => setSurface("home")} onReceipt={addReceipt} />;
  if (surface === "zretro") return <ZretroSurface onBack={() => setSurface("home")} onReceipt={addReceipt} />;
  if (surface === "telecom") return <TelecomSurface onBack={() => setSurface("home")} onReceipt={addReceipt} />;
  if (surface === "meccanincame") return <MeccanincameSurface onBack={() => setSurface("home")} onReceipt={addReceipt} />;
  if (surface === "monitor") return <ChatControlSurface onBack={() => setSurface("home")} />;
  if (surface === "evidence") return <EvidenceSurface onBack={() => setSurface("home")} receipts={receipts} />;
  if (surface === "security") return <SecuritySurface onBack={() => setSurface("home")} />;
  if (surface === "profile") return <ProfileSurface onBack={() => setSurface("home")} receiptCount={receipts.length} />;

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-background">
      <FlatList
        data={MENU_CARDS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.homeContent}
        ListHeaderComponent={<HomeHeader receiptsCount={receipts.length} />}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Apri ${item.title}`}
            onPress={() => setSurface(item.id)}
            style={({ pressed }) => [styles.menuCard, pressed && styles.menuCardPressed]}
          >
            <View style={[styles.menuIndex, { borderColor: item.accent }]}>
              <Text style={[styles.menuIndexText, { color: item.accent }]}>{item.index}</Text>
            </View>
            <View style={styles.menuCopy}>
              <View style={styles.menuTitleRow}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </View>
            <Text style={[styles.menuArrow, { color: item.accent }]}>↗</Text>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={styles.menuGap} />}
        ListFooterComponent={
          <View style={styles.homeFooter}>
            <Text style={styles.footerTitle}>MICROCOSM / LOCAL BY DESIGN</Text>
            <Text style={styles.footerText}>A teaching beta. No general-purpose shell, no network calls, no hidden execution.</Text>
            <Text style={styles.footerCode}>ZDOS // v0.1.0 · PROFILE DEFAULT-DENY</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  homeContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 36 },
  surfaceContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  topMetaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  microLabel: { color: COLORS.muted, fontSize: 10, fontWeight: "700", letterSpacing: 1.8 },
  offlinePill: { flexDirection: "row", alignItems: "center", gap: 7, borderWidth: 1, borderColor: COLORS.cyan, paddingHorizontal: 10, paddingVertical: 7 },
  offlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.cyan },
  offlineText: { color: COLORS.cyan, fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  heroTitle: { color: COLORS.ink, fontSize: 40, lineHeight: 42, fontWeight: "800", letterSpacing: -1.5 },
  heroTitleAccent: { color: COLORS.cyan, fontSize: 40, lineHeight: 42, fontWeight: "800", letterSpacing: -1.5 },
  heroSubtitle: { color: COLORS.muted, fontSize: 14, lineHeight: 21, marginTop: 10, marginBottom: 26, maxWidth: 300 },
  partnerLink: { flexDirection: "row", alignItems: "center", marginTop: -16, marginBottom: 22 },
  partnerLinkText: { color: COLORS.muted, fontSize: 11 },
  partnerLinkName: { color: COLORS.cyan, fontSize: 11, fontWeight: "900", letterSpacing: 0.4 },
  webappLink: { alignSelf: "flex-start", borderWidth: 1, borderColor: COLORS.violet, paddingHorizontal: 12, paddingVertical: 8, marginTop: -12, marginBottom: 18 },
  webappLinkText: { color: COLORS.muted, fontSize: 10, fontWeight: "800", letterSpacing: 0.7 },
  webappLinkName: { color: COLORS.violet, fontSize: 10, fontWeight: "900", letterSpacing: 0.7 },
  postureCard: { backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.line, padding: 18, marginBottom: 28 },
  postureTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  postureTitle: { color: COLORS.lime, fontSize: 28, fontWeight: "800", letterSpacing: 1, marginTop: 4 },
  readyRing: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: COLORS.lime, alignItems: "center", justifyContent: "center" },
  readyRingInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.lime },
  postureRule: { height: 1, backgroundColor: COLORS.line, marginVertical: 16 },
  markerRow: { flexDirection: "row", justifyContent: "space-between" },
  marker: { flex: 1 },
  markerValue: { color: COLORS.ink, fontSize: 11, fontWeight: "800", letterSpacing: 0.7 },
  markerCaption: { color: COLORS.muted, fontSize: 9, letterSpacing: 1.2, marginTop: 5 },
  sectionHeadingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  sectionLabel: { color: COLORS.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  sectionCount: { color: COLORS.cyan, fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  sectionIntro: { color: COLORS.muted, fontSize: 13, lineHeight: 19, marginBottom: 14 },
  sessionStrip: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.line, paddingVertical: 10, marginBottom: 14 },
  sessionStripText: { color: COLORS.muted, fontSize: 10, fontWeight: "700", letterSpacing: 1.2 },
  sessionStripValue: { color: COLORS.amber, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  menuCard: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.line, padding: 14, minHeight: 88 },
  menuCardPressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  menuGap: { height: 10 },
  menuIndex: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderWidth: 1, marginRight: 12 },
  menuIndexText: { fontSize: 11, fontWeight: "800" },
  menuCopy: { flex: 1, paddingRight: 8 },
  menuTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  menuTitle: { color: COLORS.ink, fontSize: 15, fontWeight: "800", flexShrink: 1 },
  menuDescription: { color: COLORS.muted, fontSize: 12, lineHeight: 17, marginTop: 7 },
  menuArrow: { fontSize: 22, fontWeight: "600", paddingLeft: 5 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 4, alignSelf: "flex-start" },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.7 },
  homeFooter: { borderLeftWidth: 2, borderLeftColor: COLORS.cyan, paddingLeft: 13, marginTop: 30, marginBottom: 12 },
  footerTitle: { color: COLORS.cyan, fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  footerText: { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginTop: 8 },
  footerCode: { color: "#5D737C", fontSize: 9, letterSpacing: 1.1, marginTop: 14 },
  surfaceHeader: { marginBottom: 22 },
  backButton: { flexDirection: "row", alignItems: "center", minHeight: 40, alignSelf: "flex-start", marginBottom: 20 },
  pressed: { opacity: 0.62 },
  backArrow: { color: COLORS.cyan, fontSize: 30, lineHeight: 28, marginRight: 7 },
  backText: { color: COLORS.cyan, fontSize: 10, fontWeight: "800", letterSpacing: 1.3 },
  surfaceEyebrow: { color: COLORS.muted, fontSize: 10, fontWeight: "700", letterSpacing: 1.6 },
  surfaceTitle: { color: COLORS.ink, fontSize: 27, lineHeight: 31, fontWeight: "800", letterSpacing: -0.5, marginTop: 8 },
  terminalFrame: { backgroundColor: COLORS.panelSoft, borderWidth: 1, borderColor: COLORS.cyan, marginBottom: 14 },
  terminalTopBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: COLORS.line, paddingHorizontal: 13, paddingVertical: 10 },
  terminalLights: { flexDirection: "row", gap: 6 },
  terminalLight: { width: 7, height: 7, borderRadius: 3.5 },
  terminalTopText: { color: COLORS.muted, fontSize: 9, fontWeight: "700", letterSpacing: 1.1 },
  terminalOutput: { padding: 14, minHeight: 330 },
  terminalEntry: { marginBottom: 18 },
  terminalPrompt: { color: COLORS.cyan, fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }), fontSize: 12, lineHeight: 19 },
  terminalText: { color: COLORS.ink, fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }), fontSize: 12, lineHeight: 19, marginTop: 2 },
  terminalStatus: { fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }), fontSize: 10, fontWeight: "800", letterSpacing: 1, marginTop: 4 },
  terminalInputRow: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, borderTopColor: COLORS.line, paddingTop: 12 },
  terminalInput: { flex: 1, color: COLORS.ink, fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }), fontSize: 12, padding: 0, marginLeft: 8, minHeight: 24 },
  commandHintCard: { backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.line, padding: 14 },
  commandHint: { color: COLORS.cyan, fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }), fontSize: 11, lineHeight: 20, marginTop: 9 },
  disclaimer: { color: COLORS.muted, fontSize: 11, lineHeight: 17, marginTop: 18 },
  editorCard: { backgroundColor: COLORS.panelSoft, borderWidth: 1, padding: 14, minHeight: 182, marginBottom: 14 },
  editorHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 13 },
  editorTag: { fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  codeEditor: { flex: 1, minHeight: 116, color: COLORS.ink, fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }), fontSize: 13, lineHeight: 22, padding: 0 },
  lineNumber: { color: "#5D737C", fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }), fontSize: 10, marginTop: 4 },
  primaryButton: { minHeight: 52, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 18 },
  primaryButtonPressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  primaryButtonText: { color: COLORS.void, fontSize: 12, fontWeight: "900", letterSpacing: 1.1 },
  primaryButtonArrow: { color: COLORS.void, fontSize: 20, fontWeight: "700" },
  contractCard: { backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.line, padding: 14, marginBottom: 14 },
  contractRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  contractItem: { alignItems: "center", flex: 1 },
  contractNumber: { color: COLORS.violet, fontSize: 10, fontWeight: "800" },
  contractLabel: { color: COLORS.ink, fontSize: 10, marginTop: 7 },
  resultCard: { backgroundColor: COLORS.panel, borderWidth: 1, padding: 14, marginBottom: 14 },
  resultTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  resultTitle: { color: COLORS.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  resultOutput: { color: COLORS.ink, fontSize: 18, fontWeight: "800", marginBottom: 6 },
  resultDetail: { color: COLORS.lime, fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }), fontSize: 12, lineHeight: 18 },
  receiptLink: { color: COLORS.muted, fontSize: 10, letterSpacing: 0.6, marginTop: 16 },
  emptyResultCard: { borderWidth: 1, borderColor: COLORS.line, padding: 14, marginBottom: 14 },
  emptyResultText: { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginTop: 9 },
  targetCard: { backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.line, padding: 14, marginBottom: 14 },
  targetRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 15 },
  targetChip: { borderWidth: 1, borderColor: COLORS.violet, paddingHorizontal: 10, paddingVertical: 8 },
  targetChipText: { color: COLORS.violet, fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  roadmapNote: { flexDirection: "row", alignItems: "center", gap: 10, borderTopWidth: 1, borderTopColor: COLORS.line, marginTop: 17, paddingTop: 14 },
  roadmapText: { flex: 1, color: COLORS.muted, fontSize: 11, lineHeight: 17 },
  evidenceSummary: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.amber, padding: 16, marginBottom: 16 },
  evidenceCount: { color: COLORS.amber, fontSize: 38, lineHeight: 42, fontWeight: "800", marginTop: 7 },
  evidenceSummaryText: { color: COLORS.muted, fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }), fontSize: 11, lineHeight: 18, textAlign: "right" },
  receiptCard: { backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.line, padding: 14 },
  receiptTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  receiptOperation: { color: COLORS.ink, fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }), fontSize: 12, flex: 1 },
  receiptDetail: { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginTop: 12 },
  listGap: { height: 10 },
  securityHero: { backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.red, padding: 16, marginBottom: 24 },
  securityProfile: { color: COLORS.red, fontSize: 25, fontWeight: "800", letterSpacing: 0.5, marginTop: 8 },
  securityDescription: { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginTop: 9 },
  capabilityCard: { backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.line, paddingHorizontal: 14, marginTop: 12, marginBottom: 14 },
  capabilityRow: { flexDirection: "row", paddingVertical: 16 },
  capabilityDivider: { borderBottomWidth: 1, borderBottomColor: COLORS.line },
  capabilityMarker: { width: 5, height: 42, marginRight: 13 },
  capabilityCopy: { flex: 1 },
  capabilityKey: { color: COLORS.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  capabilityValue: { fontSize: 15, fontWeight: "800", marginTop: 5 },
  capabilityDetail: { color: COLORS.muted, fontSize: 11, lineHeight: 17, marginTop: 5 },
  profileHero: { backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.cyan, padding: 16, marginBottom: 14 },
  profileId: { color: COLORS.cyan, fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }), fontSize: 18, fontWeight: "800", marginTop: 9 },
  profileRule: { height: 1, backgroundColor: COLORS.line, marginVertical: 15 },
  profilePair: { flexDirection: "row", gap: 18 },
  profilePairBlock: { flex: 1 },
  profilePairValue: { fontSize: 12, fontWeight: "800", marginTop: 6 },
  nodeCard: { backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.red, padding: 16, marginBottom: 14 },
  nodeCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  nodeStatus: { color: COLORS.red, fontSize: 22, fontWeight: "800", marginTop: 7 },
  nodeText: { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginTop: 15 },
  nodeChecklist: { borderTopWidth: 1, borderTopColor: COLORS.line, marginTop: 14, paddingTop: 12, gap: 5 },
  nodeChecklistItem: { color: COLORS.muted, fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }), fontSize: 10 },
  ztraceCard: { backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.violet, padding: 16, marginBottom: 14 },
  ztraceTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  ztraceGlyph: { color: COLORS.violet, fontSize: 22 },
  ztraceValue: { color: COLORS.violet, fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }), fontSize: 18, fontWeight: "800", letterSpacing: 0.8, marginTop: 14 },
  ztraceDescription: { color: COLORS.muted, fontSize: 11, lineHeight: 17, marginTop: 10 },
  profileGrid: { flexDirection: "row", backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.line, paddingVertical: 15, marginBottom: 14 },
  profileGridItem: { flex: 1, alignItems: "center" },
  profileGridValue: { color: COLORS.ink, fontSize: 17, fontWeight: "800" },
  profileGridLabel: { color: COLORS.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1.1, marginTop: 5 },
  boundaryCard: { borderLeftWidth: 2, borderLeftColor: COLORS.amber, paddingLeft: 14, marginTop: 14 },
  boundaryText: { color: COLORS.ink, fontSize: 13, lineHeight: 20, marginTop: 10 },
  boundaryRule: { height: 1, backgroundColor: COLORS.line, marginVertical: 14 },
  boundaryFoot: { color: COLORS.amber, fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }), fontSize: 10 },
  telecomFlex: { flex: 1 },
  meccanincameHero: { backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.violet, padding: 16, marginBottom: 18 },
  meccanincameTitle: { color: COLORS.violet, fontSize: 22, fontWeight: "800", letterSpacing: 0.5, marginTop: 8 },
  meccanincameDescription: { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginTop: 12 },
  meccanincameGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, borderTopWidth: 1, borderTopColor: COLORS.line, marginTop: 16, paddingTop: 12 },
  meccanincameValue: { color: COLORS.ink, fontSize: 12, fontWeight: "800", width: "46%" },
  meccanincameLabel: { color: COLORS.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1.1, width: "46%" },
  meccanincameInput: { backgroundColor: COLORS.panelSoft, borderWidth: 1, borderColor: COLORS.violet, color: COLORS.ink, fontSize: 13, padding: 13, marginBottom: 10 },
  meccanincameButton: { minHeight: 48, justifyContent: "center", backgroundColor: COLORS.violet, paddingHorizontal: 16, marginBottom: 4 },
  meccanincameButtonText: { color: COLORS.ink, fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  telecomHero: { backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.cyan, padding: 16, marginBottom: 22 },
  monitorHero: { backgroundColor: COLORS.panel, borderWidth: 1, padding: 16, marginBottom: 14 },
  monitorTitle: { color: COLORS.lime, fontSize: 25, fontWeight: "800", letterSpacing: 0.5, marginTop: 8 },
  monitorDescription: { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginTop: 12 },
  monitorGrid: { flexDirection: "row", borderTopWidth: 1, borderTopColor: COLORS.line, marginTop: 16, paddingTop: 14 },
  monitorUpdated: { color: COLORS.muted, fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }), fontSize: 10, marginBottom: 20 },
  nodeMatrix: { backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.line, paddingHorizontal: 14, marginBottom: 20 },
  nodeChip: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: COLORS.line, paddingVertical: 13 },
  nodePulse: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.lime, marginRight: 10 },
  nodeChipText: { color: COLORS.ink, fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }), fontSize: 12, flex: 1 },
  nodeState: { color: COLORS.lime, fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  monitorFeed: { backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.line, paddingHorizontal: 14 },
  monitorMessage: { borderBottomWidth: 1, borderBottomColor: COLORS.line, paddingVertical: 12 },
  monitorMeta: { color: COLORS.cyan, fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }), fontSize: 10, fontWeight: "800" },
  monitorBody: { color: COLORS.ink, fontSize: 12, lineHeight: 18, marginTop: 4 },
  telecomHeroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  telecomTitle: { color: COLORS.cyan, fontSize: 25, fontWeight: "800", letterSpacing: 0.5, marginTop: 8 },
  telecomDescription: { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginTop: 15 },
  telecomGrid: { flexDirection: "row", borderTopWidth: 1, borderTopColor: COLORS.line, marginTop: 16, paddingTop: 14 },
  telecomGridItem: { flex: 1 },
  telecomGridValue: { color: COLORS.ink, fontSize: 13, fontWeight: "800" },
  telecomGridLabel: { color: COLORS.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1.1, marginTop: 5 },
  antennaCard: { backgroundColor: COLORS.panelSoft, borderWidth: 1, borderColor: COLORS.violet, padding: 14, marginBottom: 18 },
  antennaTitle: { color: COLORS.ink, fontSize: 16, fontWeight: "800", marginTop: 8 },
  antennaDetail: { color: COLORS.muted, fontSize: 11, lineHeight: 17, marginTop: 7 },
  antennaButton: { borderWidth: 1, borderColor: COLORS.violet, minHeight: 42, justifyContent: "center", paddingHorizontal: 12, marginTop: 12 },
  antennaButtonText: { color: COLORS.violet, fontSize: 10, fontWeight: "900", letterSpacing: 0.8 },
  cbCard: { backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.lime, padding: 14, marginBottom: 18 },
  cbDetail: { color: COLORS.ink, fontSize: 12, lineHeight: 18, marginBottom: 10 },
  cbButton: { minHeight: 42, justifyContent: "center", backgroundColor: COLORS.lime, paddingHorizontal: 12, marginBottom: 10 },
  cbButtonText: { color: COLORS.void, fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  cbPolicy: { color: COLORS.muted, fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }), fontSize: 9, lineHeight: 15 },
  inputLabel: { color: COLORS.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1.2, marginBottom: 9 },
  telecomCodeInput: { backgroundColor: COLORS.panelSoft, borderWidth: 1, borderColor: COLORS.cyan, color: COLORS.ink, fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }), fontSize: 12, lineHeight: 20, minHeight: 150, padding: 14, textAlignVertical: "top" },
  telecomButton: { minHeight: 52, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: COLORS.cyan, paddingHorizontal: 16, marginTop: 12, marginBottom: 18 },
  telecomButtonPressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  telecomButtonText: { color: COLORS.void, fontSize: 12, fontWeight: "900", letterSpacing: 1.1 },
  telecomButtonArrow: { color: COLORS.void, fontSize: 20, fontWeight: "700" },
  telecomResultCard: { backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.lime, padding: 14, marginBottom: 14 },
  resultHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 15 },
  resultEyebrow: { color: COLORS.lime, fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  telecomOutput: { color: COLORS.ink, fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }), fontSize: 11, lineHeight: 18 },
  telecomNote: { borderLeftWidth: 2, borderLeftColor: COLORS.amber, marginTop: 18, paddingLeft: 14 },
  telecomNoteText: { color: COLORS.muted, fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }), fontSize: 10, lineHeight: 17 },
  roomScroller: { marginBottom: 12 },
  roomChip: { backgroundColor: COLORS.panelSoft, borderWidth: 1, borderColor: COLORS.line, padding: 10, marginRight: 8, minWidth: 130 },
  roomChipActive: { borderColor: COLORS.cyan, backgroundColor: "#10242A" },
  roomPage: { color: COLORS.cyan, fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }), fontSize: 10, fontWeight: "800" },
  roomTitle: { color: COLORS.ink, fontSize: 12, fontWeight: "800", marginTop: 5 },
  chatCard: { backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.line, padding: 14, marginBottom: 18 },
  chatHeader: { color: COLORS.muted, fontSize: 11, marginBottom: 12 },
  messageRow: { borderTopWidth: 1, borderTopColor: COLORS.line, paddingVertical: 9 },
  messageNick: { color: COLORS.lime, fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }), fontSize: 10, fontWeight: "900" },
  messageBody: { color: COLORS.ink, fontSize: 12, lineHeight: 18, marginTop: 3 },
  nickInput: { borderWidth: 1, borderColor: COLORS.line, color: COLORS.ink, fontSize: 11, padding: 10, marginTop: 7 },
  messageInput: { borderWidth: 1, borderColor: COLORS.cyan, color: COLORS.ink, fontSize: 12, padding: 10, marginTop: 7 },
  messageButton: { backgroundColor: COLORS.cyan, padding: 13, marginTop: 8, alignItems: "center" },
  syncButton: { borderWidth: 1, borderColor: COLORS.lime, padding: 11, marginTop: 8 },
  syncButtonText: { color: COLORS.lime, fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  syncDetail: { color: COLORS.muted, fontSize: 10, marginTop: 5 },
});
