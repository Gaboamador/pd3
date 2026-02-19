import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/useAuth.js";
import AuthScreen from "./auth/AuthScreen.jsx";
import Header from "./components/Header.jsx";
import Home from "./pages/Home.jsx";
import BuildLayout from "./components/BuildLayout.jsx";
import BuildEditor from "./build/BuildEditor.jsx";
import LibraryExplorer from "./library/pages/LibraryExplorer.jsx";
import Spinner from "./components/Spinner.jsx";
import MigrationPrompt from "./components/MigrationPrompt.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import LibraryRoulette from "./library/pages/LibraryRoulette.jsx";

function App() {

  const { loading } = useAuth();

   // Esperamos a Firebase
  if (loading) {
    return <Spinner label="Checking session…" />;
  }

  return (
    <ToastProvider>
    <>
      <MigrationPrompt />
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/randomizer" element={<BuildLayout />} />
        <Route path="/build-editor" element={<BuildEditor mode="draft" />} />
        <Route path="/build-editor/b/:encoded" element={<BuildEditor mode="owned" />} />
        <Route path="/build-editor/share/:encoded" element={<BuildEditor mode="share" />} />
        <Route path="/library-explorer" element={<LibraryExplorer />} />
        <Route path="/library-roulette" element={<LibraryRoulette />} />
        <Route path="/auth" element={<AuthScreen/>}/>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
    </ToastProvider>
  );
}

export default App;
