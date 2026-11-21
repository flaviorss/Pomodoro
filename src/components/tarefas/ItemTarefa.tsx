import type { JSX } from "react";
import { ROTULO_ESTADO, ROTULO_PRIORIDADE } from "../../domain/tarefa/rotulos";
import type { Tarefa } from "../../domain/tarefa/tipos";

type ItemTarefaProps = {
  tarefa: Tarefa;
  onEditar: (tarefa: Tarefa) => void;
  onExcluir: (tarefa: Tarefa) => void;
};

function ItemTarefa({ tarefa, onEditar, onExcluir }: ItemTarefaProps): JSX.Element {
  return (
    <li className="tarefa-card">
      <article aria-labelledby={`tarefa-${tarefa.id}-titulo`}>
        <div className="tarefa-card__cabecalho">
          <h3 id={`tarefa-${tarefa.id}-titulo`}>{tarefa.titulo}</h3>
        </div>

        <div className="tarefa-card__detalhes">
          <span className="tarefa-card__tag">Estado: {ROTULO_ESTADO[tarefa.estado]}</span>
          <span className="tarefa-card__tag">
            Prioridade: {ROTULO_PRIORIDADE[tarefa.prioridade]}
          </span>
        </div>

        <div className="tarefa-card__acoes">
          <button
            className="botao botao--secundario"
            type="button"
            aria-label={`Editar tarefa ${tarefa.titulo}`}
            onClick={() => onEditar(tarefa)}
          >
            Editar
          </button>
          <button
            className="botao botao--secundario"
            type="button"
            aria-label={`Excluir tarefa ${tarefa.titulo}`}
            onClick={() => onExcluir(tarefa)}
          >
            Excluir
          </button>
        </div>
      </article>
    </li>
  );
}

export default ItemTarefa;
export type { ItemTarefaProps };
