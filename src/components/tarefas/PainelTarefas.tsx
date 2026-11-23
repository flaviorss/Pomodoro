import { useState, useRef, type JSX } from "react";
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
  const botaoNovoRef = useRef<HTMLButtonElement>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const botoesAcoesRef = useRef<Map<string, HTMLButtonElement>>(new Map());

  function salvar(dados: DadosTarefa): ResultadoOperacaoTarefa {
    const resultado =
      formulario?.modo === "edicao" ? editar(formulario.tarefa.id, dados) : criar(dados);

    if (resultado.sucesso) {
      const tarefaId = formulario?.modo === "edicao" ? formulario.tarefa.id : null;
      setFormulario(null);
      devolverFoco(tarefaId);
    }
    return resultado;
  }

  function cancelarFormulario(): void {
    const tarefaId = formulario?.modo === "edicao" ? formulario.tarefa.id : null;
    setFormulario(null);
    devolverFoco(tarefaId);
  }

  function devolverFoco(tarefaId: string | null): void {
    setTimeout(() => {
      const botaoAcoes = tarefaId === null ? null : botoesAcoesRef.current.get(tarefaId);
      (botaoAcoes ?? botaoNovoRef.current ?? tituloRef.current)?.focus();
    }, 0);
  }

  function abrirEdicao(tarefa: Tarefa): void {
    setErroAcao(null);
    if (formulario?.modo === "edicao" && formulario.tarefa.id === tarefa.id) {
      document.getElementById("tarefa-titulo")?.focus();
    }
    setFormulario({ modo: "edicao", tarefa });
  }

  function concluir({ id, titulo, prioridade }: Tarefa): void {
    const resultado = editar(id, { titulo, prioridade, estado: "concluida" });
    setErroAcao(
      !resultado.sucesso && resultado.motivo === "naoEncontrada" ? resultado.mensagem : null,
    );
  }

  function abrirExclusao(tarefa: Tarefa): void {
    setErroAcao(null);
    setTarefaParaExcluir(tarefa);
  }

  function confirmarExclusao(): void {
    if (tarefaParaExcluir === null) return;

    const idExcluido = tarefaParaExcluir.id;
    const resultado = excluir(idExcluido);

    if (resultado.sucesso) {
      if (
        formulario?.modo === "edicao" &&
        formulario.tarefa.id === idExcluido
      ) {
        setFormulario(null);
      }
      devolverFoco(null);
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
        <h2 id="titulo-tarefas" ref={tituloRef} tabIndex={-1}>
          Tarefas
        </h2>
        {formulario === null && (
          <button
            ref={botaoNovoRef}
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
          onCancelar={cancelarFormulario}
        />
      )}

      <ListaTarefas
        tarefas={tarefas}
        onConcluir={concluir}
        onEditar={abrirEdicao}
        onExcluir={abrirExclusao}
        onRegistrarBotaoEditar={(id, node) => {
          if (node) botoesAcoesRef.current.set(id, node);
          else botoesAcoesRef.current.delete(id);
        }}
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
