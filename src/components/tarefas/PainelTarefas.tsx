import { useState, type JSX } from "react";
import type { DadosTarefa, Tarefa } from "../../domain/tarefa/tipos";
import type { ResultadoOperacaoTarefa, UseTarefas } from "../../hooks/useTarefas";
import ConfirmDialog from "../ui/ConfirmDialog";
import FormularioTarefa from "./FormularioTarefa";
import ListaTarefas from "./ListaTarefas";

type PainelTarefasProps = {
  controleTarefas: UseTarefas;
};

type FormularioAberto =
  | { modo: "criacao" }
  | { modo: "edicao"; tarefa: Tarefa }
  | null;

function PainelTarefas({ controleTarefas }: PainelTarefasProps): JSX.Element {
  const { tarefas, erro: erroTarefas, criar, editar, excluir } = controleTarefas;
  const [formulario, setFormulario] = useState<FormularioAberto>(null);
  const [tarefaParaExcluir, setTarefaParaExcluir] = useState<Tarefa | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  function salvar(dados: DadosTarefa): ResultadoOperacaoTarefa {
    const resultado =
      formulario?.modo === "edicao" ? editar(formulario.tarefa.id, dados) : criar(dados);

    if (resultado.sucesso) setFormulario(null);
    return resultado;
  }

  function abrirEdicao(tarefa: Tarefa): void {
    setErroAcao(null);
    setFormulario({ modo: "edicao", tarefa });
  }

  function abrirExclusao(tarefa: Tarefa): void {
    setErroAcao(null);
    setTarefaParaExcluir(tarefa);
  }

  function confirmarExclusao(): void {
    if (tarefaParaExcluir === null) return;

    const resultado = excluir(tarefaParaExcluir.id);

    if (resultado.sucesso) {
      if (
        formulario?.modo === "edicao" &&
        formulario.tarefa.id === tarefaParaExcluir.id
      ) {
        setFormulario(null);
      }
      setErroAcao(null);
    } else if (resultado.motivo !== "validacao" && resultado.motivo !== "persistencia") {
      setErroAcao(resultado.mensagem);
    }

    setTarefaParaExcluir(null);
  }

  return (
    <section
      className={`gerenciador-tarefas${formulario !== null ? " gerenciador-tarefas--editando" : ""}`}
      aria-labelledby="titulo-tarefas"
    >
      <div className="gerenciador-tarefas__cabecalho">
        <div>
          <h2 id="titulo-tarefas">Gerenciamento de tarefas</h2>
        </div>
        {formulario === null && (
          <button
            className="botao botao--primario"
            type="button"
            onClick={() => setFormulario({ modo: "criacao" })}
          >
            Nova tarefa
          </button>
        )}
      </div>

      {erroTarefas !== null && (
        <p className="mensagem mensagem--erro" role="alert">
          <strong>Tarefas:</strong> {erroTarefas}
        </p>
      )}

      {erroAcao !== null && (
        <p className="mensagem mensagem--erro" role="alert">
          {erroAcao}
        </p>
      )}

      {formulario !== null && (
        <FormularioTarefa
          key={formulario.modo === "edicao" ? formulario.tarefa.id : "novo"}
          tarefa={formulario.modo === "edicao" ? formulario.tarefa : undefined}
          onSalvar={salvar}
          onCancelar={() => setFormulario(null)}
        />
      )}

      <ListaTarefas
        tarefas={tarefas}
        onEditar={abrirEdicao}
        onExcluir={abrirExclusao}
      />

      {tarefaParaExcluir !== null && (
        <ConfirmDialog
          aberto
          titulo="Excluir tarefa?"
          mensagem={`A tarefa “${tarefaParaExcluir.titulo}” será excluída permanentemente.`}
          textoConfirmar="Excluir"
          onConfirmar={confirmarExclusao}
          onCancelar={() => setTarefaParaExcluir(null)}
        />
      )}
    </section>
  );
}

export default PainelTarefas;
export type { PainelTarefasProps };
