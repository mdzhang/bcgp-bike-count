import { useCallback, useState } from "react";
import CountSession from "./components/CountSession";
import Layout from "./components/Layout";
import SessionStart from "./components/SessionStart";
import type { Session } from "./types";
import {
  type PersistedAppState,
  type PersistedCountState,
  clearPersistedAppState,
  createFreshAppState,
  loadPersistedAppState,
  savePersistedAppState,
} from "./utils/persistedSession";

function App() {
  const [appState, setAppState] = useState<PersistedAppState | null>(() =>
    loadPersistedAppState(),
  );

  const handleStartSession = useCallback((session: Session) => {
    clearPersistedAppState();
    const fresh = createFreshAppState(session);
    savePersistedAppState(fresh);
    setAppState(fresh);
  }, []);

  const handlePersist = useCallback((countState: PersistedCountState) => {
    setAppState((prev) => {
      if (!prev) return prev;

      const next: PersistedAppState = {
        ...prev,
        ...countState,
      };
      savePersistedAppState(next);
      return next;
    });
  }, []);

  const handleNewSession = useCallback(() => {
    setAppState(null);
  }, []);

  return (
    <Layout>
      {!appState ? (
        <div className="flex flex-1 items-center justify-center p-4">
          <SessionStart onStart={handleStartSession} />
        </div>
      ) : (
        <CountSession
          session={appState.session}
          initialCountState={appState}
          onPersist={handlePersist}
          onNewSession={handleNewSession}
        />
      )}
    </Layout>
  );
}

export default App;
