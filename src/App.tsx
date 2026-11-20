import type React from "react";
import GerenciadorPresets from "./components/presets/GerenciadorPresets";
import { obterPresetEmUsoId } from "./domain/sessao/sessao";
import { usePresets } from "./hooks/usePresets";
import { useSessao } from "./hooks/useSessao";

function App(): React.JSX.Element {
  const controleSessao = useSessao();
  const presetEmUsoId = obterPresetEmUsoId(controleSessao.sessao);
  const controlePresets = usePresets(presetEmUsoId);

  return (
    <div className="app-shell">
      <header className="app-cabecalho">
        <h1>Pomodoro</h1>
      </header>

      <main>
        <GerenciadorPresets
          controlePresets={controlePresets}
          controleSessao={controleSessao}
          presetEmUsoId={presetEmUsoId}
        />
      </main>
    </div>
  );
}

export default App;
