import React, { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Role } from "../types";
import { WELCOME_IMAGE } from "../demo";
import {
  Avatar,
  Banner,
  Brand,
  Button,
  Card,
  Field,
  HeaderButton,
  Pill,
  ParanzaLogo,
  Screen,
  Title,
} from "../ui";
import { theme } from "../theme";

type Step = "welcome" | "role" | "profile" | "customize" | "success";

export function Onboarding({ onEnter }: { onEnter: (role: Role) => void }) {
  const [step, setStep] = useState<Step>("welcome");
  const [role, setRole] = useState<Role>("cullatore");
  const [position, setPosition] = useState("Base sinistra");

  if (step === "welcome") {
    return (
      <View style={styles.welcomeRoot}>
        <View style={styles.welcomeImage}>
          <Image
            source={WELCOME_IMAGE}
            resizeMode="cover"
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.welcomeShade} />
        </View>

        <View style={styles.loginSheet}>
          <Text style={styles.loginTitle}>Benvenuto su Mezzo Passo</Text>
          <Text style={styles.loginBody}>
            L’app dedicata ai cullatori della Festa dei Gigli di Nola.
          </Text>
          <Button
            title="Continua con Google"
            icon="logo-google"
            onPress={() => setStep("role")}
          />
          <Button
            title="Continua con Apple"
            icon="logo-apple"
            variant="secondary"
            onPress={() => setStep("role")}
          />
          <Pressable onPress={() => setStep("role")}>
            <Text style={styles.createAccount}>Crea un account</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (step === "role") {
    return (
      <Screen key="role">
        <HeaderLine onBack={() => setStep("welcome")} />
        <Title subtitle="Scegli come vuoi usare Mezzo Passo per iniziare.">
          Che ruolo hai?
        </Title>

        <RoleCard
          selected={role === "capoparanza"}
          icon="ribbon-outline"
          title="Sono un capoparanza"
          body="Organizzo la paranza, creo eventi e comunico con i cullatori."
          onPress={() => setRole("capoparanza")}
        />
        <RoleCard
          selected={role === "cullatore"}
          icon="people"
          title="Sono un cullatore"
          body="Partecipo agli eventi, ricevo le comunicazioni della tua paranza."
          onPress={() => setRole("cullatore")}
        />

        <View style={styles.pushBottom} />
        <Button title="Avanti" onPress={() => setStep("profile")} />
      </Screen>
    );
  }

  if (step === "profile") {
    return (
      <Screen key="profile">
        <HeaderLine onBack={() => setStep("role")} />
        {role === "capoparanza" ? (
          <>
            <Title subtitle="Inserisci le informazioni principali.">
              Crea la tua paranza
            </Title>
            <View style={styles.avatarBlock}>
              <View style={styles.managerAvatarPlaceholder}>
                <Ionicons name="person" size={34} color="#B9C7DD" />
              </View>
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </View>
            </View>
            <Field label="Nome paranza" value="Orgoglio Nolano" onChangeText={() => {}} />
            <Field label="Capoparanza" value="Luca Iorio" onChangeText={() => {}} />
            <Field
              label="Descrizione (opzionale)"
              value={"Tradizione, Passione, Nola.\nUniti sotto gli stessi colori."}
              onChangeText={() => {}}
              multiline
            />
          </>
        ) : (
          <>
            <Title subtitle="Inserisci le tue informazioni per unirti alla paranza.">
              Completa il tuo profilo
            </Title>
            <View style={styles.avatarBlock}>
              <Avatar initials="DE" size={72} />
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </View>
            </View>
            <Field label="Nome" value="Davide" onChangeText={() => {}} />
            <Field label="Cognome" value="Esposito" onChangeText={() => {}} />
            <Field
              label="Data di nascita"
              value="14 Marzo 1992"
              icon="calendar-outline"
              onChangeText={() => {}}
            />
            <Field
              label="Posizione nel Giglio"
              value={position}
              icon="people-outline"
              onChangeText={setPosition}
            />
          </>
        )}

        <View style={styles.pushBottom} />
        <Button title="Avanti" onPress={() => setStep("customize")} />
      </Screen>
    );
  }

  if (step === "customize") {
    return (
      <Screen key="customize">
        <HeaderLine onBack={() => setStep("profile")} />
        {role === "capoparanza" ? (
          <>
            <Title subtitle="Seleziona due colori che rappresentano la tua paranza. Saranno utilizzati nell’app e nelle comunicazioni.">
              Scegli i colori della tua paranza
            </Title>
            <View style={styles.palette}>
              {["#FFFFFF", "#0A4DBA", "#B8C0CF", "#8F9DB2", "#617693", "#5B92F4", "#4B859B", "#7B899C", "#B0BBCB", "#D6D9DE"].map((color, i) => (
                <View
                  key={color}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color },
                    (i === 0 || i === 1) && styles.colorSelected,
                  ]}
                >
                  {i === 0 || i === 1 ? (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={i === 0 ? theme.colors.blue : "#FFFFFF"}
                    />
                  ) : null}
                </View>
              ))}
            </View>

            <Text style={styles.labelUpper}>ANTEPRIMA</Text>
            <Banner />
            <Text style={styles.labelUpper}>COLORI SELEZIONATI</Text>
            <View style={styles.selectedColors}>
              <View style={styles.colorLabel}>
                <View style={[styles.swatch, { backgroundColor: "#FFFFFF" }]} />
                <Text style={styles.smallBody}>Bianco</Text>
              </View>
              <View style={styles.colorLabel}>
                <View style={[styles.swatch, { backgroundColor: theme.colors.blue }]} />
                <Text style={styles.smallBody}>Blu</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <Title subtitle="Inserisci il codice invito o cerca la tua paranza.">
              Unisciti alla tua paranza
            </Title>
            <Field
              label="Codice invito (opzionale)"
              value=""
              placeholder="Inserisci codice invito"
              icon="key-outline"
              onChangeText={() => {}}
            />
            <Banner />
            <Card>
              <View style={styles.paranzaTitleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.paranzaName}>Orgoglio Nolano</Text>
                  <Text style={styles.smallBody}>Capoparanza · Luca Iorio</Text>
                </View>
                <Pill label="Paranza" active />
              </View>
              <Text style={styles.smallBody}>Tradizione, Passione, Nola.</Text>
              <View style={styles.paranzaStats}>
                <MiniStat value="24" label="Cullatori" />
                <MiniStat value="2010" label="Anno di fondazione" />
                <MiniStat value="Nola" label="Città" />
              </View>
            </Card>
          </>
        )}

        <View style={styles.pushBottom} />
        <Button
          title={role === "capoparanza" ? "Avanti" : "Unisciti alla paranza"}
          onPress={() => setStep("success")}
        />
      </Screen>
    );
  }

  return (
    <Screen key="success">
      <View style={styles.pushTop} />
      <View style={styles.successIcon}>
        <Ionicons name="checkmark" size={52} color={theme.colors.blueDark} />
      </View>
      <View style={styles.successCopy}>
        <Text style={styles.successTitle}>
          {role === "capoparanza" ? "Paranza creata!" : "Profilo completato!"}
        </Text>
        <Text style={styles.successBody}>
          {role === "capoparanza"
            ? "Orgoglio Nolano è pronta. Ora puoi invitare i tuoi cullatori e iniziare a organizzare gli eventi."
            : "Ora sei parte della paranza Orgoglio Nolano. Sei pronto a vivere insieme la Festa dei Gigli di Nola!"}
        </Text>
      </View>

      {role === "capoparanza" ? (
        <Card style={styles.identityRow}>
          <ParanzaLogo size={48} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.identityName}>Orgoglio Nolano</Text>
            <Text style={styles.smallBody}>Capoparanza{"\n"}Luca Iorio</Text>
          </View>
          <Ionicons name="chevron-forward" size={17} color={theme.colors.blue} />
        </Card>
      ) : (
        <Card style={styles.identityCard}>
          <ParanzaLogo size={68} />
          <Text style={styles.identityName}>Orgoglio Nolano</Text>
          <Text style={styles.smallBody}>Capoparanza{"\n"}Luca Iorio</Text>
        </Card>
      )}

      <View style={styles.pushBottom} />
      {role === "capoparanza" ? (
        <>
          <Button
            title="Invita i cullatori"
            icon="person-add-outline"
            onPress={() => onEnter(role)}
          />
          <Button
            title="Vai alla tua paranza"
            variant="secondary"
            onPress={() => onEnter(role)}
          />
        </>
      ) : (
        <Button title="Entra nell’app" onPress={() => onEnter(role)} />
      )}
    </Screen>
  );
}

function HeaderLine({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.headerLine}>
      <HeaderButton icon="chevron-back" onPress={onBack} />
      <View style={{ flex: 1 }} />
    </View>
  );
}

function RoleCard({
  selected,
  icon,
  title,
  body,
  onPress,
}: {
  selected: boolean;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  body: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <Card style={selected ? styles.roleSelected : undefined}>
        <View style={styles.roleRow}>
          <View style={styles.roleIcon}>
            <Ionicons name={icon} size={22} color={theme.colors.blue} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={styles.roleTitle}>{title}</Text>
            <Text style={styles.smallBody}>{body}</Text>
          </View>
          {selected ? (
            <View style={styles.roleCheck}>
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            </View>
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniValue}>{value}</Text>
      <Text style={styles.miniLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  welcomeRoot: { flex: 1, backgroundColor: "#FFFFFF" },
  welcomeImage: { height: 520, justifyContent: "flex-start", overflow: "hidden" },
  welcomeShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(5,31,78,0.20)",
  },
  loginSheet: {
    flex: 1,
    marginTop: -18,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 26,
    gap: 10,
  },
  loginTitle: {
    color: theme.colors.blueDark,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  loginBody: {
    color: theme.colors.text,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
    marginBottom: 2,
  },
  createAccount: {
    color: theme.colors.blue,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "800",
    textDecorationLine: "underline",
    marginTop: 2,
  },
  headerLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 34,
  },
  pushBottom: { flex: 1, minHeight: 8 },
  pushTop: { flex: 0.4 },
  roleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  roleSelected: { borderColor: theme.colors.blue, borderWidth: 1.8 },
  roleIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  roleTitle: {
    color: theme.colors.blueDark,
    fontSize: 13,
    fontWeight: "900",
  },
  roleCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBlock: {
    alignSelf: "center",
    marginVertical: 3,
  },
  managerAvatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EEF2F8",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: 2,
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: theme.colors.blue,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  palette: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  colorCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#D9DFE8",
    alignItems: "center",
    justifyContent: "center",
  },
  colorSelected: {
    borderWidth: 2,
    borderColor: theme.colors.blue,
  },
  labelUpper: {
    color: theme.colors.text,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  selectedColors: { flexDirection: "row", gap: 22 },
  colorLabel: { flexDirection: "row", alignItems: "center", gap: 8 },
  swatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C8D1DD",
  },
  smallBody: { color: theme.colors.text, fontSize: 11, lineHeight: 16 },
  paranzaTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  paranzaName: {
    color: theme.colors.blueDark,
    fontSize: 15,
    fontWeight: "900",
  },
  paranzaStats: { flexDirection: "row", gap: 6, marginTop: 2 },
  miniStat: {
    flex: 1,
    minHeight: 54,
    borderRadius: 8,
    backgroundColor: theme.colors.blueMist,
    alignItems: "center",
    justifyContent: "center",
  },
  miniValue: { color: theme.colors.blueDark, fontSize: 14, fontWeight: "900" },
  miniLabel: {
    color: theme.colors.muted,
    fontSize: 7,
    textAlign: "center",
    paddingHorizontal: 3,
  },
  successIcon: {
    width: 106,
    height: 106,
    borderRadius: 53,
    backgroundColor: theme.colors.blueSoft,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  successCopy: { alignItems: "center", gap: 7, paddingHorizontal: 12 },
  successTitle: {
    color: theme.colors.blueDark,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  successBody: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  identityCard: { alignItems: "center" },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  identityName: {
    color: theme.colors.blueDark,
    fontSize: 15,
    fontWeight: "900",
  },
});
