import React, { useState } from "react";
import { StatusBar } from "react-native";
import { Onboarding } from "./src/screens/Onboarding";
import { ManagerApp } from "./src/screens/ManagerApp";
import { CullatoreApp } from "./src/screens/CullatoreApp";
import { Role } from "./src/types";

export default function App() {
  const [role, setRole] = useState<Role>();

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FBFCFE" />
      {!role ? (
        <Onboarding onEnter={setRole} />
      ) : role === "capoparanza" ? (
        <ManagerApp onLogout={() => setRole(undefined)} />
      ) : (
        <CullatoreApp onLogout={() => setRole(undefined)} />
      )}
    </>
  );
}
