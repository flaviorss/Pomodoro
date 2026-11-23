import { useRef, useState, type JSX } from "react";
import type { EntradaPreset, TemporizadorPersonalizado } from "../../domain/preset/tipos";
import type { ResultadoOperacaoPreset, UsePresets } from "../../hooks/usePresets";
import type { UseSessao } from "../../hooks/useSessao";
import ConfirmDialog from "../ui/ConfirmDialog";
import FormularioPreset from "./FormularioPreset";
import ListaPresets from "./ListaPresets";

type GerenciadorPresetsProps = {
  controlePresets: UsePresets;
  controleSessao: UseSessao;
  presetEmUsoId: string | null;
  onLiberarAudio?: () => void;
};

type FormularioAberto =
  { modo: "criacao" } | { modo: "edicao"; preset: TemporizadorPersonalizado } | null;

function GerenciadorPresets({
  controlePresets,
  controleSessao,
  presetEmUsoId,
  onLiberarAudio,
}: GerenciadorPresetsProps): JSX.Element {
  const { presets, erro: erroPresets, criar, editar, excluir } = controlePresets;
  const { iniciar, trocarPreset } = controleSessao;
  const [formulario, setFormulario] = useState<FormularioAberto>(null);
  const [presetParaExcluir, setPresetParaExcluir] =
    useState<TemporizadorPersonalizado | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);

  function fecharFormulario(): void {
    setFormulario(null);
    tituloRef.current?.focus();
  }

  function salvar(dados: EntradaPreset): ResultadoOperacaoPreset {
    const resultado =
      formulario?.modo === "edicao" ? editar(formulario.preset.id, dados) : criar(dados);

    if (resultado.sucesso) fecharFormulario();
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

  function selecionarPreset(preset: TemporizadorPersonalizado): void {
    if (preset.id === presetEmUsoId) return;

    onLiberarAudio?.();
    if (presetEmUsoId === null) iniciar(preset);
    else trocarPreset(preset);
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
      tituloRef.current?.focus();
    } else if (resultado.motivo !== "validacao" && resultado.motivo !== "persistencia") {
      setErroAcao(resultado.mensagem);
    }

    setPresetParaExcluir(null);
  }

  return (
    <section
      className={`gerenciador-presets${formulario !== null ? " gerenciador-presets--editando" : ""}`}
      aria-labelledby="titulo-presets"
    >
      <div className="gerenciador-presets__cabecalho">
        <div>
          <h2 id="titulo-presets" ref={tituloRef} tabIndex={-1}>
            Temporizadores personalizados
          </h2>
        </div>
        {formulario === null && (
          <button
            className="botao botao--primario tn"
            type="button"
            onClick={() => setFormulario({ modo: "criacao" })}
          >
            Novo Temporizador
          </button>
        )}
      </div>

      {erroPresets !== null && (
        <p className="mensagem mensagem--erro" role="alert">
          <strong>Temporizadores:</strong> {erroPresets}
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
          onCancelar={fecharFormulario}
        />
      )}

      <ListaPresets
        presets={presets}
        presetEmUsoId={presetEmUsoId}
        onSelecionar={selecionarPreset}
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
