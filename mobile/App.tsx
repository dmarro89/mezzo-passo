import React, { useState } from "react";
import { StatusBar } from "react-native";
import { Onboarding } from "./src/screens/Onboarding";
import { ManagerApp } from "./src/screens/ManagerApp";
import { CullatoreApp } from "./src/screens/CullatoreApp";
import { Paranza, Role } from "./src/types";

type Session = {
  role: Role;
  token?: string;
  paranza?: Paranza;
};

export default function App() {
  const [session, setSession] = useState<Session>();

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FBFCFE" />
      {!session ? (
        <Onboarding
          onEnter={(role, token, paranza) =>
            setSession({ role, token, paranza })
          }
        />
      ) : session.role === "capoparanza" ? (
        <ManagerApp
          token={session.token}
          paranza={session.paranza}
          onLogout={() => setSession(undefined)}
        />
      ) : (
        <CullatoreApp onLogout={() => setSession(undefined)} />
      )}
    </>
  );
}
