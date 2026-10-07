import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Role } from "../types";
import { Banner, Brand, Button, Card, Field, Screen, Title } from "../ui";
import { theme } from "../theme";

type Props = {
  busy: boolean;
  error?: string;
  onEnter: (role: Role) => void;
};

export function Onboarding({ busy, error, onEnter }: Props) {
  const [step, setStep] = useState<"welcome" | "role" | "details">("welcome");
  const [role, setRole] = useState<Role>("cullatore");
  const [firstName, setFirstName] = useState("Davide");
  const [lastName, setLastName] = useState("Esposito");
  const [position, setPosition] = useState("Ritiro sinistro");

  if (step === "welcome") {
    return (
      <Screen>
        <View style={styles.hero}>
          <Brand />
          <Text style={styles.kicker}>FESTA DEI GIGLI DI NOLA</Text>
          <Text style={styles.heroTitle}>La tua paranza, sempre con te.</Text>
          <Text style={styles.heroBody}>
            Eventi, comunicazioni, presenze e organizzazione in un'unica app
            pensata per chi vive il Giglio.
          </Text>
        </View>
        <Card>
          <Text style={styles.cardTitle}>Benvenuto su Mezzo Passo</Text>
          <Text style={styles.copy}>
            Questa prima versione usa due account demo per farti provare subito
            entrambe le esperienze.
          </Text>
          <Button title="Inizia" onPress={() => setStep("role")} />
        </Card>
      </Screen>
    );
  }

  if (step === "role") {
    return (
      <Screen>
        <Brand compact />
        <Title subtitle="Scegli come vuoi usare Mezzo Passo.">Che ruolo hai?</Title>

        <Pressable onPress={() => setRole("cullatore")}>
          <Card style={role === "cullatore" ? styles.selected : undefined}>
            <Text style={styles.cardTitle}>Sono un cullatore</Text>
            <Text style={styles.copy}>
              Partecipo agli eventi, ricevo comunicazioni e confermo la mia presenza.
            </Text>
          </Card>
        </Pressable>

        <Pressable onPress={() => setRole("capoparanza")}>
          <Card style={role === "capoparanza" ? styles.selected : undefined}>
            <Text style={styles.cardTitle}>Sono un capoparanza</Text>
            <Text style={styles.copy}>
              Organizzo la paranza, creo eventi e seguo le presenze dei cullatori.
            </Text>
          </Card>
        </Pressable>

        <Button title="Avanti" onPress={() => setStep("details")} />
        <Button title="Indietro" variant="ghost" onPress={() => setStep("welcome")} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Brand compact />
      {role === "capoparanza" ? (
        <>
          <Title subtitle="Configurazione demo della tua paranza.">
            Crea la tua paranza
          </Title>
          <Field
            label="Nome paranza"
            value="Orgoglio Nolano"
            onChangeText={() => undefined}
          />
          <Field
            label="Capoparanza"
            value="Luca Iorio"
            onChangeText={() => undefined}
          />
          <Text style={styles.sectionLabel}>COLORI DELLA PARANZA</Text>
          <View style={styles.colors}>
            <View style={[styles.color, { backgroundColor: "#FFFFFF" }]} />
            <View style={[styles.color, { backgroundColor: theme.colors.blue }]} />
            <Text style={styles.copy}>Bianco · Blu</Text>
          </View>
          <Banner />
          <Text style={styles.note}>
            Nell'MVP la configurazione è già pronta per la demo. La persistenza
            dell'onboarding completo arriverà nel passo successivo.
          </Text>
        </>
      ) : (
        <>
          <Title subtitle="Completa il profilo per unirti alla paranza.">
            Il tuo profilo
          </Title>
          <Field label="Nome" value={firstName} onChangeText={setFirstName} />
          <Field label="Cognome" value={lastName} onChangeText={setLastName} />
          <Field
            label="Posizione nel Giglio"
            value={position}
            onChangeText={setPosition}
          />
          <Banner />
          <Card>
            <Text style={styles.cardTitle}>Orgoglio Nolano</Text>
            <Text style={styles.copy}>Capoparanza · Luca Iorio</Text>
            <Text style={styles.copy}>Invito demo · MEZZOPASSO</Text>
          </Card>
        </>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        title={busy ? "Accesso..." : "Entra nella demo"}
        disabled={busy}
        onPress={() => onEnter(role)}
      />
      <Button title="Indietro" variant="ghost" onPress={() => setStep("role")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    minHeight: 330,
    backgroundColor: theme.colors.blueSoft,
    borderRadius: 28,
    padding: 24,
    justifyContent: "flex-end",
    gap: 12,
  },
  kicker: {
    color: theme.colors.blue,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2.2,
  },
  heroTitle: {
    color: theme.colors.blueDark,
    fontSize: 36,
    lineHeight: 40,
    fontWeight: "800",
    letterSpacing: -1.2,
    maxWidth: 300,
  },
  heroBody: {
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 23,
    maxWidth: 320,
  },
  cardTitle: {
    color: theme.colors.ink,
    fontWeight: "800",
    fontSize: 17,
  },
  copy: { color: theme.colors.text, fontSize: 14, lineHeight: 20 },
  selected: {
    borderColor: theme.colors.blue,
    borderWidth: 2,
    backgroundColor: theme.colors.blueSoft,
  },
  sectionLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  colors: { flexDirection: "row", alignItems: "center", gap: 10 },
  color: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  note: { color: theme.colors.muted, fontSize: 12, lineHeight: 18 },
  error: { color: theme.colors.danger, fontWeight: "700" },
});
