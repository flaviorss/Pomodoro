import type { JSX } from "react";
import { ROTULO_ESTADO, ROTULO_PRIORIDADE } from "../../domain/tarefa/rotulos";
import type { Tarefa } from "../../domain/tarefa/tipos";

type ItemTarefaProps = {
  tarefa: Tarefa;
  onEditar: (tarefa: Tarefa) => void;
  onExcluir: (tarefa: Tarefa) => void;
  refBotaoEditar?: (node: HTMLButtonElement | null) => void;
};

function ItemTarefa({
  tarefa,
  onEditar,
  onExcluir,
  refBotaoEditar,
}: ItemTarefaProps): JSX.Element {
  return (
    <li className="tarefa-card">
      <article aria-labelledby={`tarefa-${tarefa.id}-titulo`}>
        <div className="tarefa-card__cabecalho">
          <h3 id={`tarefa-${tarefa.id}-titulo`}>{tarefa.titulo}</h3>
        </div>

        <div className="tarefa-card__detalhes">
          <span className="tarefa-card__tag">
            Estado: <strong>{ROTULO_ESTADO[tarefa.estado]}</strong>
          </span>
          <span className="tarefa-card__tag">
            Prioridade: <strong>{ROTULO_PRIORIDADE[tarefa.prioridade]}</strong>
          </span>
        </div>

        <div className="tarefa-card__acoes">
          <button
            ref={refBotaoEditar}
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
