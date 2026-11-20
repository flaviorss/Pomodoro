import type React from "react";
import GerenciadorPresets from "./components/presets/GerenciadorPresets";

function App(): React.JSX.Element {
  return (
    <div className="app-shell">
      <header className="app-cabecalho">
        <h1>Pomodoro</h1>
      </header>

      <main>
        <GerenciadorPresets />
      </main>
    </div>
  );
}

export default App;
