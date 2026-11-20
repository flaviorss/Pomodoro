import { useState, type JSX } from "react";
import type { EntradaPreset, TemporizadorPersonalizado } from "../../domain/preset/tipos";
import { usePresets, type ResultadoOperacaoPreset } from "../../hooks/usePresets";
import ConfirmDialog from "../ui/ConfirmDialog";
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
  const { presets, erro, criar, editar, excluir } = usePresets(presetEmUsoId);
  const [formulario, setFormulario] = useState<FormularioAberto>(null);
  const [presetParaExcluir, setPresetParaExcluir] =
    useState<TemporizadorPersonalizado | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  function salvar(dados: EntradaPreset): ResultadoOperacaoPreset {
    const resultado =
      formulario?.modo === "edicao" ? editar(formulario.preset.id, dados) : criar(dados);

    if (resultado.sucesso) setFormulario(null);
    return resultado;
  }

  function abrirEdicao(preset: TemporizadorPersonalizado): void {
    setErroAcao(null);
    setFormulario({ modo: "edicao", preset });
  }

  function abrirExclusao(preset: TemporizadorPersonalizado): void {
    setErroAcao(null);
    setPresetParaExcluir(preset);
  }

  function confirmarExclusao(): void {
    if (presetParaExcluir === null) return;

    const resultado = excluir(presetParaExcluir.id);

    if (resultado.sucesso) {
      if (
        formulario?.modo === "edicao" &&
        formulario.preset.id === presetParaExcluir.id
      ) {
        setFormulario(null);
      }
      setErroAcao(null);
    } else if (resultado.motivo !== "validacao" && resultado.motivo !== "persistencia") {
      setErroAcao(resultado.mensagem);
    }

    setPresetParaExcluir(null);
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

      {erroAcao !== null && (
        <p className="mensagem mensagem--erro" role="alert">
          {erroAcao}
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
        onExcluir={abrirExclusao}
      />

      {presetParaExcluir !== null && (
        <ConfirmDialog
          aberto
          titulo="Excluir temporizador?"
          mensagem={`O temporizador “${presetParaExcluir.nome}” será excluído permanentemente.`}
          textoConfirmar="Excluir"
          onConfirmar={confirmarExclusao}
          onCancelar={() => setPresetParaExcluir(null)}
        />
      )}
    </section>
  );
}

export default GerenciadorPresets;
export type { GerenciadorPresetsProps };
