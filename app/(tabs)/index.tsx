import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

type ProjectId = "zdos" | "zlang";

type Project = {
  id: ProjectId;
  number: string;
  name: string;
  subtitle: string;
  status: "VERIFIED" | "PREPARED";
  description: string;
  facts: string[];
};

const COLORS = {
  void: "#070A0F",
  panel: "#101820",
  panelSoft: "#0C131A",
  cyan: "#28E6F0",
  lime: "#B7FF2A",
  violet: "#8B5CF6",
  ink: "#EAF2F4",
  muted: "#8A9BA3",
  line: "#263842",
};

const ASCII_ART: Record<ProjectId, string[]> = {
  zdos: ["  /\\_/\\", " ( o.o )", "  > ^ <"],
  zlang: ["  .----.", " / ZLB2 \\", " `----´"],
};

const PROJECTS: Project[] = [
  {
    id: "zdos",
    number: "01",
    name: "ZDOS",
    subtitle: "KERNEL / DISTRO / EVIDENCE",
    status: "VERIFIED",
    description: "Sistema operativo sperimentale e percorso di build controllato dell’ecosistema ZDOS.",
    facts: ["Target principale: x86_64", "Build e boot QEMU nel percorso ufficiale", "Policy Evidence Chain disponibile"],
  },
  {
    id: "zlang",
    number: "02",
    name: "ZLANG",
    subtitle: "COMPILER / VM / ZLB2",
    status: "VERIFIED",
    description: "Linguaggio, compilatore e runtime collegati al contratto bytecode ZLB2.",
    facts: ["Contratto ZLB2 v2.5", "Compiler e VM nel repository ufficiale", "Validazione locale soltanto in questa beta"],
  },
];

function StatusBadge({ status }: { status: Project["status"] }) {
  return (
    <View style={styles.badge}>
      <View style={[styles.dot, { backgroundColor: status === "VERIFIED" ? COLORS.lime : COLORS.violet }]} />
      <Text style={[styles.badgeText, { color: status === "VERIFIED" ? COLORS.lime : COLORS.violet }]}>{status}</Text>
    </View>
  );
}

function AsciiArt({ project }: { project: ProjectId }) {
  const color = project === "zdos" ? COLORS.cyan : COLORS.violet;
  return (
    <View style={[styles.asciiFrame, { borderColor: color }]} accessibilityLabel={`Micro immagine ASCII ${project}`}>
      {ASCII_ART[project].map((line) => (
        <Text key={line} style={[styles.asciiLine, { color }]}>{line}</Text>
      ))}
    </View>
  );
}

function ProjectCard({ project, active, onPress }: { project: Project; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Apri progetto ${project.name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.projectCard, active && styles.projectCardActive, pressed && styles.pressed]}
    >
      <View style={styles.cardTopRow}>
        <Text style={styles.cardNumber}>{project.number}</Text>
        <StatusBadge status={project.status} />
      </View>
      <View style={styles.cardIdentity}>
        <AsciiArt project={project.id} />
        <View style={styles.cardIdentityText}>
          <Text style={styles.projectName}>{project.name}</Text>
          <Text style={styles.projectSubtitle}>{project.subtitle}</Text>
        </View>
      </View>
      <Text style={styles.projectDescription}>{project.description}</Text>
      <Text style={styles.openLabel}>{active ? "APERTA" : "APRI PROGETTO"}  ↗</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const [selected, setSelected] = useState<ProjectId | null>(null);
  const project = PROJECTS.find((item) => item.id === selected) ?? null;

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.metaRow}>
          <Text style={styles.eyebrow}>ZDOS / MICROcosm</Text>
          <View style={styles.offlinePill}>
            <View style={styles.offlineDot} />
            <Text style={styles.offlineText}>OFFLINE BETA</Text>
          </View>
        </View>

        <Text style={styles.title}>PROJECTS</Text>
        <Text style={styles.subtitle}>Accesso minimo ai due progetti ufficiali dell’ecosistema.</Text>

        <View style={styles.postureCard}>
          <View>
            <Text style={styles.smallLabel}>SYSTEM POSTURE</Text>
            <Text style={styles.posture}>READY</Text>
          </View>
          <View style={styles.ring}><View style={styles.ringInner} /></View>
          <View style={styles.rule} />
          <View style={styles.markers}>
            <View><Text style={styles.markerValue}>LOCAL</Text><Text style={styles.markerCaption}>SESSION</Text></View>
            <View><Text style={styles.markerValue}>DENIED</Text><Text style={styles.markerCaption}>NETWORK</Text></View>
            <View><Text style={styles.markerValue}>READ-ONLY</Text><Text style={styles.markerCaption}>UI</Text></View>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>PROJECT MENU</Text>
          <Text style={styles.sectionCount}>02</Text>
        </View>
        <Text style={styles.helper}>Seleziona un progetto per vedere il profilo locale. Nessun comando viene eseguito sul dispositivo.</Text>

        {PROJECTS.map((item) => (
          <ProjectCard key={item.id} project={item} active={selected === item.id} onPress={() => setSelected(item.id)} />
        ))}

        {project ? (
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <View><Text style={styles.smallLabel}>LOCAL PROFILE</Text><Text style={styles.detailTitle}>{project.name}</Text></View>
              <StatusBadge status={project.status} />
            </View>
            <View style={styles.rule} />
            {project.facts.map((fact) => (
              <View key={fact} style={styles.factRow}><Text style={styles.factMark}>+</Text><Text style={styles.fact}>{fact}</Text></View>
            ))}
            <Text style={styles.note}>Profilo informativo offline. Build, compilazione e runtime nativi restano fuori da questa beta minima.</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Chiudi profilo progetto" onPress={() => setSelected(null)} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
              <Text style={styles.closeText}>CHIUDI PROFILO</Text>
            </Pressable>
          </View>
        ) : null}

        <Text style={styles.footer}>ZDOS LAB CONSOLE · MINIMAL BETA · DEFAULT-DENY</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 22, paddingBottom: 40, backgroundColor: COLORS.void, minHeight: "100%" },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 28 },
  eyebrow: { color: COLORS.cyan, fontSize: 12, fontWeight: "700", letterSpacing: 1.4 },
  offlinePill: { borderWidth: 1, borderColor: COLORS.line, paddingHorizontal: 9, paddingVertical: 6, flexDirection: "row", alignItems: "center", gap: 6 },
  offlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.lime },
  offlineText: { color: COLORS.muted, fontSize: 9, fontWeight: "700", letterSpacing: 1 },
  title: { color: COLORS.ink, fontSize: 42, fontWeight: "900", letterSpacing: -1, lineHeight: 48 },
  subtitle: { color: COLORS.muted, fontSize: 15, lineHeight: 22, marginTop: 7, marginBottom: 22, maxWidth: 320 },
  postureCard: { backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.line, padding: 18, marginBottom: 28 },
  smallLabel: { color: COLORS.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1.3 },
  posture: { color: COLORS.lime, fontSize: 27, fontWeight: "900", marginTop: 4 },
  ring: { position: "absolute", right: 18, top: 18, width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: COLORS.lime, alignItems: "center", justifyContent: "center" },
  ringInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.lime },
  rule: { height: 1, backgroundColor: COLORS.line, marginVertical: 16 },
  markers: { flexDirection: "row", justifyContent: "space-between" },
  markerValue: { color: COLORS.ink, fontSize: 11, fontWeight: "800" },
  markerCaption: { color: COLORS.muted, fontSize: 9, marginTop: 3, letterSpacing: 1 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionLabel: { color: COLORS.cyan, fontSize: 11, fontWeight: "900", letterSpacing: 1.5 },
  sectionCount: { color: COLORS.muted, fontSize: 12, fontWeight: "800" },
  helper: { color: COLORS.muted, fontSize: 13, lineHeight: 19, marginTop: 8, marginBottom: 14 },
  projectCard: { backgroundColor: COLORS.panelSoft, borderWidth: 1, borderColor: COLORS.line, padding: 18, marginTop: 10 },
  projectCardActive: { borderColor: COLORS.cyan },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardNumber: { color: COLORS.muted, fontSize: 12, fontWeight: "800" },
  badge: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  cardIdentity: { flexDirection: "row", alignItems: "center", marginTop: 16, gap: 14 },
  cardIdentityText: { flex: 1 },
  asciiFrame: { width: 82, minHeight: 70, borderWidth: 1, paddingVertical: 8, paddingHorizontal: 5, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.void },
  asciiLine: { fontFamily: "monospace", fontSize: 12, lineHeight: 16, fontWeight: "800" },
  projectName: { color: COLORS.ink, fontSize: 30, fontWeight: "900" },
  projectSubtitle: { color: COLORS.cyan, fontSize: 10, fontWeight: "800", letterSpacing: 1, marginTop: 3 },
  projectDescription: { color: COLORS.muted, fontSize: 14, lineHeight: 20, marginTop: 13 },
  openLabel: { color: COLORS.lime, fontSize: 11, fontWeight: "900", letterSpacing: 1, marginTop: 18 },
  detailCard: { backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.cyan, padding: 18, marginTop: 18 },
  detailHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  detailTitle: { color: COLORS.ink, fontSize: 24, fontWeight: "900", marginTop: 5 },
  factRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12, gap: 10 },
  factMark: { color: COLORS.lime, fontSize: 16, fontWeight: "900" },
  fact: { color: COLORS.ink, fontSize: 14, lineHeight: 20, flex: 1 },
  note: { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  closeButton: { borderWidth: 1, borderColor: COLORS.line, padding: 13, alignItems: "center", marginTop: 18 },
  closeText: { color: COLORS.cyan, fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  footer: { color: "#4D626A", fontSize: 9, fontWeight: "800", letterSpacing: 1.1, textAlign: "center", marginTop: 30 },
});
