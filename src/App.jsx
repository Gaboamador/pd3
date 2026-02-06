// import Header from "./components/Header.jsx";
// import BuildLayout from "./components/BuildLayout.jsx";
// import BuildEditor from "./build/BuildEditor.jsx";

// function App() {
//   return (
//     <>
//       <Header />
//       <BuildLayout />
//       <BuildEditor />
//     </>
//   );
// }

// export default App;
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import BuildLayout from "./components/BuildLayout.jsx";
import BuildEditor from "./build/BuildEditor.jsx";
import Home from "./pages/Home.jsx";

function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/randomizer" element={<BuildLayout />} />
        <Route path="/build-editor" element={<BuildEditor />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
