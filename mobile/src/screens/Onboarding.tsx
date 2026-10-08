import React, { useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Paranza, Role } from "../types";
import { demoLogin, api } from "../api";
import { WELCOME_IMAGE } from "../demo";
import {
  Avatar,
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

const PARANZA_COLORS = [
  "#FFFFFF",
  "#000000",
  "#E53935",
  "#FB8C00",
  "#FDD835",
  "#43A047",
  "#00897B",
  "#00ACC1",
  "#1E88E5",
  "#0A4DBA",
  "#3949AB",
  "#5E35B1",
  "#8E24AA",
  "#D81B60",
  "#F06292",
  "#6D4C41",
  "#795548",
  "#9E9E9E",
  "#607D8B",
  "#263238",
  "#B8C0CF",
  "#5B92F4",
  "#4B859B",
  "#D6D9DE",
];

const COLOR_NAMES: Record<string, string> = {
  "#FFFFFF": "Bianco",
  "#000000": "Nero",
  "#E53935": "Rosso",
  "#FB8C00": "Arancio",
  "#FDD835": "Giallo",
  "#43A047": "Verde",
  "#00897B": "Verde acqua",
  "#00ACC1": "Ciano",
  "#1E88E5": "Azzurro",
  "#0A4DBA": "Blu",
  "#3949AB": "Indaco",
  "#5E35B1": "Viola",
  "#8E24AA": "Porpora",
  "#D81B60": "Fucsia",
  "#F06292": "Rosa",
  "#6D4C41": "Marrone",
  "#795548": "Terra",
  "#9E9E9E": "Grigio",
  "#607D8B": "Grigio blu",
  "#263238": "Antracite",
  "#B8C0CF": "Grigio chiaro",
  "#5B92F4": "Blu cielo",
  "#4B859B": "Petrolio",
  "#D6D9DE": "Ghiaccio",
};

export function Onboarding({
  onEnter,
}: {
  onEnter: (role: Role, token?: string, paranza?: Paranza) => void;
}) {
  const [step, setStep] = useState<Step>("welcome");
  const [role, setRole] = useState<Role>("capoparanza");
  const [position, setPosition] = useState("Base sinistra");

  const [paranzaName, setParanzaName] = useState("Orgoglio Nolano");
  const [managerName, setManagerName] = useState("Luca Iorio");
  const [description, setDescription] = useState(
    "Tradizione, Passione, Nola.\nUniti sotto gli stessi colori.",
  );
  const [primaryColor, setPrimaryColor] = useState("#FFFFFF");
  const [secondaryColor, setSecondaryColor] = useState("#0A4DBA");
  const [activeColorSlot, setActiveColorSlot] = useState<1 | 2>(1);
  const [managerPhotoUri, setManagerPhotoUri] = useState<string>();
  const [managerPhotoDataUrl, setManagerPhotoDataUrl] = useState<string>();
  const [sessionToken, setSessionToken] = useState<string>();
  const [savedParanza, setSavedParanza] = useState<Paranza>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function setPaletteColor(color: string) {
    setError("");
    if (activeColorSlot === 1) {
      setPrimaryColor(color);
      setActiveColorSlot(2);
    } else {
      setSecondaryColor(color);
      setActiveColorSlot(1);
    }
  }

  function updateCustomColor(slot: 1 | 2, value: string) {
    const normalized = value.startsWith("#") ? value.toUpperCase() : "#" + value.toUpperCase();
    if (slot === 1) {
      setPrimaryColor(normalized);
    } else {
      setSecondaryColor(normalized);
    }
    setActiveColorSlot(slot);
    setError("");
  }

  async function pickManagerPhoto() {
    setError("");
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Consenti l’accesso alle foto per scegliere un’immagine.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.45,
      base64: true,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    setManagerPhotoUri(asset.uri);
    if (asset.base64) {
      const mimeType = asset.mimeType ?? "image/jpeg";
      setManagerPhotoDataUrl("data:" + mimeType + ";base64," + asset.base64);
    }
  }

  function isValidHex(value: string) {
    return /^#[0-9A-F]{6}$/i.test(value);
  }

  function goToCustomize() {
    setError("");
    if (role === "capoparanza") {
      if (!paranzaName.trim()) {
        setError("Inserisci il nome della paranza.");
        return;
      }
      if (!managerName.trim()) {
        setError("Inserisci il nome del capoparanza.");
        return;
      }
    }
    setStep("customize");
  }

  async function saveOnboarding() {
    if (role !== "capoparanza") {
      setStep("success");
      return;
    }
    if (!isValidHex(primaryColor) || !isValidHex(secondaryColor)) {
      setError("Inserisci due colori validi in formato HEX, ad esempio #0A4DBA.");
      return;
    }
    if (primaryColor.toUpperCase() === secondaryColor.toUpperCase()) {
      setError("Scegli due colori differenti.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      let token = sessionToken;
      if (!token) {
        const login = await demoLogin("capoparanza");
        token = login.token;
        setSessionToken(token);
      }

      const paranza = await api.saveParanzaOnboarding(token, {
        name: paranzaName.trim(),
        description: description.trim(),
        managerName: managerName.trim(),
        primaryColor: primaryColor.toUpperCase(),
        secondaryColor: secondaryColor.toUpperCase(),
        photoDataUrl: managerPhotoDataUrl,
      });
      setSavedParanza(paranza);
      setStep("success");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Non è stato possibile salvare la paranza.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (step === "welcome") {
    return (
      <SafeAreaView style={styles.welcomeRoot}>
        <ScrollView
          style={styles.welcomeScroll}
          contentContainerStyle={styles.welcomeContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.welcomeImage}>
            <Image
              source={WELCOME_IMAGE}
              resizeMode="cover"
              blurRadius={16}
              style={styles.welcomeBackdrop}
            />
            <View style={styles.welcomeShade} />
            <Image
              source={WELCOME_IMAGE}
              resizeMode="contain"
              style={styles.welcomePhoto}
            />
          </View>

          <View style={styles.loginSheet}>
            <Text style={styles.loginTitle}>Benvenuto su Mezzo Passo</Text>
            <Text style={styles.loginBody}>
              L’app dedicata ai cullatori della Festa dei Gigli di Nola.
            </Text>
            <Button
              title="Continua con Google"
              icon="logo-google"
              large
              onPress={() => setStep("role")}
            />
            <Button
              title="Continua con Apple"
              icon="logo-apple"
              variant="secondary"
              large
              onPress={() => setStep("role")}
            />
            <Pressable
              accessibilityRole="button"
              style={styles.createAccountButton}
              onPress={() => setStep("role")}
            >
              <Text style={styles.createAccount}>Crea un account</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === "role") {
    return (
      <Screen key="role">
        <HeaderLine onBack={() => setStep("welcome")} />
        <Title large subtitle="Scegli come vuoi usare Mezzo Passo per iniziare.">
          Che ruolo hai?
        </Title>

        <RoleCard
          selected={role === "cullatore"}
          icon="people"
          title="Sono un cullatore"
          body="Partecipo agli eventi, ricevo le comunicazioni della paranza e resto aggiornato."
          onPress={() => setRole("cullatore")}
        />
        <RoleCard
          selected={role === "capoparanza"}
          icon="ribbon"
          title="Sono un capoparanza"
          body="Crea e gestisci la tua paranza. Organizza eventi e comunica con i cullatori."
          onPress={() => setRole("capoparanza")}
        />

        <View style={styles.pushBottom} />
        <Button large title="Avanti" onPress={() => setStep("profile")} />
      </Screen>
    );
  }

  if (step === "profile") {
    return (
      <Screen key="profile">
        <HeaderLine onBack={() => setStep("role")} />
        {role === "capoparanza" ? (
          <>
            <Title large subtitle="Inserisci le informazioni principali.">
              Crea la tua paranza
            </Title>

            <View style={styles.avatarBlock}>
              <View style={styles.managerAvatarPlaceholder}>
                <Ionicons name="person" size={44} color="#B9C7DD" />
              </View>
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={17} color="#FFFFFF" />
              </View>
            </View>

            <Field
              large
              label="Nome paranza"
              value={paranzaName}
              onChangeText={setParanzaName}
            />
            <Field
              large
              label="Capoparanza"
              value={managerName}
              onChangeText={setManagerName}
            />
            <Field
              large
              label="Descrizione (opzionale)"
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </>
        ) : (
          <>
            <Title large subtitle="Inserisci le tue informazioni per unirti alla paranza.">
              Completa il tuo profilo
            </Title>
            <View style={styles.avatarBlock}>
              <Avatar initials="DE" size={92} />
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={17} color="#FFFFFF" />
              </View>
            </View>
            <Field large label="Nome" value="Davide" onChangeText={() => {}} />
            <Field large label="Cognome" value="Esposito" onChangeText={() => {}} />
            <Field
              large
              label="Data di nascita"
              value="14 Marzo 1992"
              icon="calendar-outline"
              onChangeText={() => {}}
            />
            <Field
              large
              label="Posizione nel Giglio"
              value={position}
              icon="people-outline"
              onChangeText={setPosition}
            />
          </>
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <View style={styles.pushBottom} />
        <Button large title="Avanti" onPress={goToCustomize} />
      </Screen>
    );
  }

  if (step === "customize") {
    return (
      <Screen key="customize">
        <HeaderLine onBack={() => setStep("profile")} />
        {role === "capoparanza" ? (
          <>
            <Title
              large
              subtitle="Seleziona due colori che rappresentano la tua paranza. Saranno utilizzati nell’app e nelle comunicazioni."
            >
              Scegli i colori della tua paranza
            </Title>

            <View style={styles.palette}>
              {PARANZA_COLORS.map((color) => {
                const selected = selectedColors.includes(color);
                return (
                  <Pressable
                    key={color}
                    accessibilityRole="button"
                    accessibilityLabel={`Seleziona ${COLOR_NAMES[color] ?? color}`}
                    onPress={() => toggleColor(color)}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color },
                      selected && styles.colorSelected,
                    ]}
                  >
                    {selected ? (
                      <Ionicons
                        name="checkmark"
                        size={19}
                        color={color === "#FFFFFF" ? theme.colors.blue : "#FFFFFF"}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.labelUpper}>Anteprima</Text>
            <Banner name={paranzaName || "La tua paranza"} />
            <Text style={styles.labelUpper}>Colori selezionati</Text>
            <View style={styles.selectedColors}>
              {selectedColors.map((color) => (
                <View key={color} style={styles.colorLabel}>
                  <View style={[styles.swatch, { backgroundColor: color }]} />
                  <Text style={styles.smallBody}>
                    {COLOR_NAMES[color] ?? color}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            <Title large subtitle="Inserisci il codice invito o cerca la tua paranza.">
              Unisciti alla tua paranza
            </Title>
            <Field
              large
              label="Codice invito (opzionale)"
              value=""
              placeholder="Inserisci codice invito"
              icon="key-outline"
              onChangeText={() => {}}
            />
            <Banner />
            <Card style={styles.joinCard}>
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

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <View style={styles.pushBottom} />
        <Button
          large
          disabled={saving || (role === "capoparanza" && selectedColors.length !== 2)}
          title={
            saving
              ? "Salvataggio..."
              : role === "capoparanza"
                ? "Crea paranza"
                : "Unisciti alla paranza"
          }
          onPress={saveOnboarding}
        />
      </Screen>
    );
  }

  return (
    <Screen key="success">
      <View style={styles.successTopSpace} />
      <View style={styles.successIcon}>
        <Ionicons name="checkmark" size={62} color={theme.colors.blueDark} />
      </View>

      <View style={styles.successCopy}>
        <Text style={styles.successTitle}>
          {role === "capoparanza" ? "Paranza creata!" : "Profilo completato!"}
        </Text>
        <Text style={styles.successBody}>
          {role === "capoparanza"
            ? `${savedParanza?.name ?? paranzaName} è pronta. Ora puoi invitare i tuoi cullatori e iniziare a organizzare gli eventi.`
            : "Ora sei parte della paranza Orgoglio Nolano. Sei pronto a vivere insieme la Festa dei Gigli di Nola!"}
        </Text>
      </View>

      {role === "capoparanza" ? (
        <Card style={styles.identityRow}>
          <ParanzaLogo size={72} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.identityName}>
              {savedParanza?.name ?? paranzaName}
            </Text>
            <Text style={styles.identityMeta}>
              Capoparanza{"\n"}{savedParanza?.managerName ?? managerName}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.blue} />
        </Card>
      ) : (
        <Card style={styles.identityCard}>
          <ParanzaLogo size={82} />
          <Text style={styles.identityName}>Orgoglio Nolano</Text>
          <Text style={styles.identityMeta}>Capoparanza{"\n"}Luca Iorio</Text>
        </Card>
      )}

      <View style={styles.pushBottom} />
      {role === "capoparanza" ? (
        <>
          <Button
            large
            title="Invita i cullatori"
            icon="person-add-outline"
            onPress={() => onEnter(role, sessionToken, savedParanza)}
          />
          <Button
            large
            title="Vai alla tua paranza"
            variant="secondary"
            onPress={() => onEnter(role, sessionToken, savedParanza)}
          />
        </>
      ) : (
        <Button large title="Entra nell’app" onPress={() => onEnter(role)} />
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
      <Card style={[styles.roleCard, selected ? styles.roleSelected : undefined]}>
        <View style={styles.roleRow}>
          <View style={styles.roleIcon}>
            <Ionicons name={icon} size={29} color={theme.colors.blue} />
          </View>
          <View style={styles.roleCopy}>
            <Text style={styles.roleTitle}>{title}</Text>
            <Text style={styles.roleBody}>{body}</Text>
          </View>
          {selected ? (
            <View style={styles.roleCheck}>
              <Ionicons name="checkmark" size={15} color="#FFFFFF" />
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
  welcomeScroll: { flex: 1 },
  welcomeContent: { flexGrow: 1 },
  welcomeImage: {
    flexGrow: 1,
    flexBasis: 0,
    minHeight: 200,
    overflow: "hidden",
    backgroundColor: "#D9DEE7",
  },
  welcomeBackdrop: {
    ...StyleSheet.absoluteFill,
    opacity: 0.52,
  },
  welcomePhoto: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
  },
  welcomeShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(5,31,78,0.18)",
  },
  loginSheet: {
    flexShrink: 0,
    marginTop: -24,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 44,
    gap: 14,
  },
  loginTitle: {
    color: theme.colors.blueDark,
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "900",
    textAlign: "center",
  },
  loginBody: {
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 4,
  },
  createAccountButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    marginBottom: 8,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  createAccount: {
    color: theme.colors.blue,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "800",
    textDecorationLine: "underline",
  },

  headerLine: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
  },
  pushBottom: { flex: 1, minHeight: 14 },

  roleCard: {
    minHeight: 126,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 17,
  },
  roleSelected: {
    borderColor: theme.colors.blue,
    borderWidth: 2,
  },
  roleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  roleIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  roleCopy: {
    flex: 1,
    gap: 6,
  },
  roleTitle: {
    color: theme.colors.blueDark,
    fontSize: 19,
    lineHeight: 23,
    fontWeight: "900",
  },
  roleBody: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  roleCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.blue,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarBlock: {
    alignSelf: "center",
    marginVertical: 4,
  },
  managerAvatarPlaceholder: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#EEF2F8",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.blue,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  palette: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  colorCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
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
    fontSize: 14,
    fontWeight: "800",
  },
  selectedColors: {
    flexDirection: "row",
    gap: 30,
  },
  colorLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  swatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#C8D1DD",
  },
  smallBody: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  joinCard: {
    padding: 18,
  },
  paranzaTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  paranzaName: {
    color: theme.colors.blueDark,
    fontSize: 19,
    fontWeight: "900",
  },
  paranzaStats: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  miniStat: {
    flex: 1,
    minHeight: 72,
    borderRadius: 10,
    backgroundColor: theme.colors.blueMist,
    alignItems: "center",
    justifyContent: "center",
  },
  miniValue: {
    color: theme.colors.blueDark,
    fontSize: 18,
    fontWeight: "900",
  },
  miniLabel: {
    color: theme.colors.muted,
    fontSize: 10,
    textAlign: "center",
    paddingHorizontal: 4,
  },

  successTopSpace: {
    height: 26,
  },
  successIcon: {
    width: 126,
    height: 126,
    borderRadius: 63,
    backgroundColor: theme.colors.blueSoft,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  successCopy: {
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
  },
  successTitle: {
    color: theme.colors.blueDark,
    fontSize: 31,
    lineHeight: 36,
    fontWeight: "900",
    textAlign: "center",
  },
  successBody: {
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 23,
    textAlign: "center",
  },
  identityCard: {
    alignItems: "center",
    padding: 18,
  },
  identityRow: {
    minHeight: 112,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
  },
  identityName: {
    color: theme.colors.blueDark,
    fontSize: 19,
    lineHeight: 23,
    fontWeight: "900",
  },
  identityMeta: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
});
