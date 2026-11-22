import type { JSX } from "react";
import type { Tarefa } from "../../domain/tarefa/tipos";
import ItemTarefa from "./ItemTarefa";

type ListaTarefasProps = {
  tarefas: Tarefa[];
  onConcluir?: (tarefa: Tarefa) => void;
  onEditar: (tarefa: Tarefa) => void;
  onExcluir: (tarefa: Tarefa) => void;
  onRegistrarBotaoEditar?: (id: string, node: HTMLButtonElement | null) => void;
};

function ListaTarefas({
  tarefas,
  onConcluir,
  onEditar,
  onExcluir,
  onRegistrarBotaoEditar,
}: ListaTarefasProps): JSX.Element {
  if (tarefas.length === 0) {
    return (
      <div className="estado-vazio" role="status">
        <p className="estado-vazio__titulo">Nenhuma tarefa cadastrada</p>
      </div>
    );
  }

  return (
    <>
      <p className="lista-tarefas__resumo" aria-live="polite">
        {tarefas.length}{" "}
        {tarefas.length === 1 ? "tarefa cadastrada" : "tarefas cadastradas"}
      </p>
      <ul className="lista-tarefas lista-tarefas--carregada" aria-label="Tarefas cadastradas">
        {tarefas.map((tarefa) => (
          <ItemTarefa
            key={tarefa.id}
            tarefa={tarefa}
            onConcluir={onConcluir}
            onEditar={onEditar}
            onExcluir={onExcluir}
            refBotaoEditar={(node) => onRegistrarBotaoEditar?.(tarefa.id, node)}
          />
        ))}
      </ul>
    </>
  );
}

export default ListaTarefas;
export type { ListaTarefasProps };
