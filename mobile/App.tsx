import React, { useState } from "react";
import { StatusBar } from "react-native";
import { demoLogin } from "./src/api";
import { Onboarding } from "./src/screens/Onboarding";
import { ManagerApp } from "./src/screens/ManagerApp";
import { CullatoreApp } from "./src/screens/CullatoreApp";
import { Role } from "./src/types";

export default function App() {
  const [token, setToken] = useState<string>();
  const [role, setRole] = useState<Role>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function enter(selectedRole: Role) {
    setBusy(true);
    setError("");
    try {
      const result = await demoLogin(selectedRole);
      setRole(selectedRole);
      setToken(result.token);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Impossibile collegarsi al backend. Controlla EXPO_PUBLIC_API_URL.",
      );
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    setToken(undefined);
    setRole(undefined);
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      {!token || !role ? (
        <Onboarding busy={busy} error={error} onEnter={enter} />
      ) : role === "capoparanza" ? (
        <ManagerApp token={token} onLogout={logout} />
      ) : (
        <CullatoreApp token={token} onLogout={logout} />
      )}
    </>
  );
}
