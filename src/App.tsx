import type React from "react";
import GerenciadorPresets from "./components/presets/GerenciadorPresets";
import PainelSessao from "./components/sessao/PainelSessao";
import { obterPresetEmUsoId } from "./domain/sessao/sessao";
import { useAlertaSonoro } from "./hooks/useAlertaSonoro";
import { usePresets } from "./hooks/usePresets";
import { useSessao } from "./hooks/useSessao";

function App(): React.JSX.Element {
  const controleSessao = useSessao();
  const presetEmUsoId = obterPresetEmUsoId(controleSessao.sessao);
  const controlePresets = usePresets(presetEmUsoId);
  const alertaSonoro = useAlertaSonoro();

  return (
    <div className="app-shell">
      <header className="app-cabecalho">
        <h1>Pomodoro</h1>
      </header>

      <main className="app-conteudo">
        <PainelSessao
          controleSessao={controleSessao}
          presets={controlePresets.presets}
          audioLiberado={alertaSonoro.audioLiberado}
          onLiberarAudio={alertaSonoro.liberarAudio}
          onFimDeFase={alertaSonoro.emitirAlerta}
        />
        <GerenciadorPresets
          controlePresets={controlePresets}
          controleSessao={controleSessao}
          presetEmUsoId={presetEmUsoId}
          onLiberarAudio={alertaSonoro.liberarAudio}
        />
      </main>
    </div>
  );
}

export default App;
