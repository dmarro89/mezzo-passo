import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Role } from "../types";
import { Avatar, Banner, Brand, Button, Card, Field, Screen, Title } from "../ui";
import { theme } from "../theme";

export function Onboarding({ onEnter }: { onEnter: (role: Role) => void }) {
  const [step, setStep] = useState<"welcome" | "role" | "profile" | "join">("welcome");
  const [role, setRole] = useState<Role>("cullatore");

  if (step === "welcome") {
    return (
      <Screen key="welcome">
        <View style={styles.welcomeHero}>
          <View style={styles.giglioMark}>
            <View style={styles.giglioLine} />
            <View style={[styles.giglioLine, { height: 94, opacity: 0.7 }]} />
            <View style={[styles.giglioLine, { height: 68, opacity: 0.42 }]} />
          </View>
          <Brand />
          <View style={styles.welcomeCopy}>
            <Text style={styles.eyebrow}>FESTA DEI GIGLI DI NOLA</Text>
            <Text style={styles.heroTitle}>La paranza, sempre con te.</Text>
            <Text style={styles.heroText}>
              Organizza, partecipa e resta aggiornato con un'esperienza pensata
              per i cullatori.
            </Text>
          </View>
        </View>

        <Card elevated>
          <Text style={styles.cardTitle}>Benvenuto su Mezzo Passo</Text>
          <Text style={styles.copy}>
            In questa demo puoi provare entrambe le viste senza account reale.
          </Text>
          <Button title="Continua" onPress={() => setStep("role")} />
        </Card>
      </Screen>
    );
  }

  if (step === "role") {
    return (
      <Screen key="role">
        <Brand compact />
        <Title subtitle="Scegli come vuoi usare Mezzo Passo per iniziare.">
          Che ruolo hai?
        </Title>

        <RoleCard
          selected={role === "cullatore"}
          initials="CU"
          title="Sono un cullatore"
          body="Partecipo agli eventi, ricevo comunicazioni e resto aggiornato."
          onPress={() => setRole("cullatore")}
        />
        <RoleCard
          selected={role === "capoparanza"}
          initials="CP"
          title="Sono un capoparanza"
          body="Creo e gestisco la paranza, organizzo eventi e comunico con i cullatori."
          onPress={() => setRole("capoparanza")}
        />

        <View style={styles.footerActions}>
          <Button title="Avanti" onPress={() => setStep("profile")} />
          <Button title="Indietro" variant="ghost" onPress={() => setStep("welcome")} />
        </View>
      </Screen>
    );
  }

  if (step === "profile") {
    return (
      <Screen key="profile">
        <Brand compact />
        {role === "capoparanza" ? (
          <>
            <Title subtitle="Inserisci le informazioni principali.">
              Crea la tua paranza
            </Title>
            <View style={styles.avatarCenter}>
              <Avatar initials="LI" size={74} />
            </View>
            <Field label="Nome paranza" value="Orgoglio Nolano" onChangeText={() => {}} />
            <Field label="Capoparanza" value="Luca Iorio" onChangeText={() => {}} />
            <Field
              label="Descrizione"
              value="Tradizione, passione, Nola. Uniti sotto gli stessi colori."
              onChangeText={() => {}}
              multiline
            />
            <Text style={styles.fieldCaption}>COLORI DELLA PARANZA</Text>
            <View style={styles.colorRow}>
              <View style={[styles.colorDot, { backgroundColor: "#FFFFFF" }]} />
              <View style={[styles.colorDot, { backgroundColor: theme.colors.blue }]} />
              <Text style={styles.copy}>Bianco · Blu</Text>
            </View>
            <Banner />
          </>
        ) : (
          <>
            <Title subtitle="Inserisci le informazioni per unirti alla paranza.">
              Completa il tuo profilo
            </Title>
            <View style={styles.avatarCenter}>
              <Avatar initials="DE" size={74} />
            </View>
            <Field label="Nome" value="Davide" onChangeText={() => {}} />
            <Field label="Cognome" value="Esposito" onChangeText={() => {}} />
            <Field label="Data di nascita" value="14 Marzo 1992" onChangeText={() => {}} />
            <Field label="Posizione nel Giglio" value="Ritiro sinistro" onChangeText={() => {}} />
          </>
        )}

        <View style={styles.footerActions}>
          <Button title="Avanti" onPress={() => setStep("join")} />
          <Button title="Indietro" variant="ghost" onPress={() => setStep("role")} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen key="join">
      <Brand compact />
      {role === "capoparanza" ? (
        <>
          <View style={styles.successMark}><Text style={styles.successTick}>✓</Text></View>
          <Title subtitle="Orgoglio Nolano è pronta. Ora puoi iniziare a organizzare la paranza.">
            Paranza creata!
          </Title>
          <Banner />
          <Card>
            <Text style={styles.cardTitle}>Orgoglio Nolano</Text>
            <Text style={styles.copy}>Capoparanza · Luca Iorio</Text>
            <Text style={styles.copy}>Colori · Bianco / Blu</Text>
          </Card>
        </>
      ) : (
        <>
          <Title subtitle="Inserisci il codice invito per unirti alla tua paranza.">
            Unisciti alla tua paranza
          </Title>
          <Field label="Codice invito" value="MEZZOPASSO" onChangeText={() => {}} />
          <Banner />
          <Card>
            <Text style={styles.cardTitle}>Orgoglio Nolano</Text>
            <Text style={styles.copy}>Capoparanza · Luca Iorio</Text>
            <Text style={styles.copy}>Nola · 32 cullatori</Text>
          </Card>
        </>
      )}

      <Button
        title={role === "capoparanza" ? "Vai alla tua paranza" : "Unisciti alla paranza"}
        onPress={() => onEnter(role)}
      />
      <Button title="Indietro" variant="ghost" onPress={() => setStep("profile")} />
    </Screen>
  );
}

function RoleCard({
  selected,
  initials,
  title,
  body,
  onPress,
}: {
  selected: boolean;
  initials: string;
  title: string;
  body: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.82 }}>
      <Card style={selected ? styles.selected : undefined}>
        <View style={styles.roleRow}>
          <Avatar initials={initials} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.copy}>{body}</Text>
          </View>
          <View style={[styles.radio, selected && styles.radioSelected]}>
            {selected ? <View style={styles.radioInner} /> : null}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  welcomeHero: {
    minHeight: 410,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.blueDeep,
    padding: 24,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  giglioMark: {
    position: "absolute",
    right: 34,
    top: 34,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 7,
  },
  giglioLine: {
    width: 8,
    height: 124,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    opacity: 0.9,
  },
  welcomeCopy: { gap: 9, paddingTop: 190 },
  eyebrow: {
    color: "#BCD0F7",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2.2,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 38,
    lineHeight: 41,
    fontWeight: "900",
    letterSpacing: -1.4,
    maxWidth: 310,
  },
  heroText: {
    color: "#D6E1F8",
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 315,
  },
  cardTitle: { color: theme.colors.blueDark, fontSize: 16, fontWeight: "900" },
  copy: { color: theme.colors.text, fontSize: 13, lineHeight: 19 },
  roleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  selected: { borderColor: theme.colors.blue, borderWidth: 2, backgroundColor: theme.colors.blueSoft },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: "#B8C4D7", alignItems: "center", justifyContent: "center" },
  radioSelected: { borderColor: theme.colors.blue },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.blue },
  footerActions: { gap: 8, marginTop: 4 },
  avatarCenter: { alignItems: "center", marginVertical: 4 },
  fieldCaption: { color: theme.colors.muted, fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  colorRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  colorDot: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: theme.colors.line },
  successMark: { alignSelf: "center", width: 82, height: 82, borderRadius: 41, backgroundColor: theme.colors.blueSoft, alignItems: "center", justifyContent: "center", marginVertical: 8 },
  successTick: { color: theme.colors.blue, fontSize: 38, fontWeight: "900" },
});
