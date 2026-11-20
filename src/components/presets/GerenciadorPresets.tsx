import { useState, type JSX } from "react";
import type { EntradaPreset, TemporizadorPersonalizado } from "../../domain/preset/tipos";
import { usePresets, type ResultadoOperacaoPreset } from "../../hooks/usePresets";
import FormularioPreset from "./FormularioPreset";
import ListaPresets from "./ListaPresets";

type GerenciadorPresetsProps = {
  presetEmUsoId?: string | null;
};

type FormularioAberto =
  { modo: "criacao" } | { modo: "edicao"; preset: TemporizadorPersonalizado } | null;

function GerenciadorPresets({
  presetEmUsoId = null,
}: GerenciadorPresetsProps): JSX.Element {
  const { presets, erro, criar, editar } = usePresets(presetEmUsoId);
  const [formulario, setFormulario] = useState<FormularioAberto>(null);

  function salvar(dados: EntradaPreset): ResultadoOperacaoPreset {
    const resultado =
      formulario?.modo === "edicao" ? editar(formulario.preset.id, dados) : criar(dados);

    if (resultado.sucesso) setFormulario(null);
    return resultado;
  }

  function abrirEdicao(preset: TemporizadorPersonalizado): void {
    setFormulario({ modo: "edicao", preset });
  }

  return (
    <section className="gerenciador-presets" aria-labelledby="titulo-presets">
      <div className="gerenciador-presets__cabecalho">
        <div>
          <h2 id="titulo-presets">Temporizadores personalizados</h2>

        </div>
        {formulario === null && (
          <button
            className="botao botao--primario"
            type="button"
            onClick={() => setFormulario({ modo: "criacao" })}
          >
            Novo temporizador
          </button>
        )}
      </div>

      {erro !== null && (
        <p className="mensagem mensagem--erro" role="alert">
          {erro}
        </p>
      )}

      {formulario !== null && (
        <FormularioPreset
          key={formulario.modo === "edicao" ? formulario.preset.id : "novo"}
          preset={formulario.modo === "edicao" ? formulario.preset : undefined}
          onSalvar={salvar}
          onCancelar={() => setFormulario(null)}
        />
      )}

      <ListaPresets
        presets={presets}
        presetEmUsoId={presetEmUsoId}
        onEditar={abrirEdicao}
      />
    </section>
  );
}

export default GerenciadorPresets;
export type { GerenciadorPresetsProps };
