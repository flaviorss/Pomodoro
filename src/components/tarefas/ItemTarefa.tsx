import { useEffect, useId, useLayoutEffect, useRef, useState, type JSX, type KeyboardEvent } from "react";
import { ROTULO_ESTADO, ROTULO_PRIORIDADE } from "../../domain/tarefa/rotulos";
import type { Tarefa } from "../../domain/tarefa/tipos";

type ItemTarefaProps = {
  tarefa: Tarefa;
  onConcluir?: (tarefa: Tarefa) => void;
  onEditar: (tarefa: Tarefa) => void;
  onExcluir: (tarefa: Tarefa) => void;
  refBotaoEditar?: (node: HTMLButtonElement | null) => void;
};

function ItemTarefa({
  tarefa,
  onConcluir,
  onEditar,
  onExcluir,
  refBotaoEditar,
}: ItemTarefaProps): JSX.Element {
  const [aberto, setAberto] = useState(false);
  const menuId = useId();
  const acoesRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const editarRef = useRef<HTMLButtonElement>(null);
  const excluirRef = useRef<HTMLButtonElement>(null);
  const moverFocoParaAcoes = useRef(false);
  const concluida = tarefa.estado === "concluida";

  useLayoutEffect(() => {
    if (concluida && moverFocoParaAcoes.current) {
      moverFocoParaAcoes.current = false;
      botaoRef.current?.focus();
    }
  }, [concluida]);

  useEffect(() => {
    if (!aberto) return;

    menuRef.current?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    editarRef.current?.focus();

    function fecharAoClicarFora(evento: PointerEvent): void {
      if (evento.target instanceof Node && !acoesRef.current?.contains(evento.target)) {
        setAberto(false);
      }
    }

    document.addEventListener("pointerdown", fecharAoClicarFora);
    return () => document.removeEventListener("pointerdown", fecharAoClicarFora);
  }, [aberto]);

  function fecharComFoco(): void {
    setAberto(false);
    botaoRef.current?.focus();
  }

  function tratarTecla(evento: KeyboardEvent<HTMLDivElement>): void {
    switch (evento.key) {
      case "Escape":
        evento.preventDefault();
        fecharComFoco();
        break;
      case "Tab":
        fecharComFoco();
        break;
      case "Home":
        evento.preventDefault();
        editarRef.current?.focus();
        break;
      case "End":
        evento.preventDefault();
        excluirRef.current?.focus();
        break;
      case "ArrowDown":
      case "ArrowUp":
        evento.preventDefault();
        (evento.target === editarRef.current ? excluirRef : editarRef).current?.focus();
        break;
    }
  }

  return (
    <li className={concluida ? "tarefa-card tarefa-card--concluida" : "tarefa-card"}>
      <article aria-labelledby={`tarefa-${tarefa.id}-titulo`}>
        <div className="tarefa-card__cabecalho">
          <div className="tarefa-card__titulo">
            {onConcluir && (
              <input
                className="tarefa-card__checkbox"
                type="checkbox"
                aria-label={`Concluir tarefa ${tarefa.titulo}`}
                disabled={concluida}
                checked={concluida}
                onChange={(evento) => {
                  moverFocoParaAcoes.current = document.activeElement === evento.currentTarget;
                  onConcluir(tarefa);
                }}
              />
            )}
            <h3 id={`tarefa-${tarefa.id}-titulo`}>{tarefa.titulo}</h3>
          </div>
          <div
            ref={acoesRef}
            className="tarefa-card__acoes"
            onBlur={(evento) => {
              if (!evento.currentTarget.contains(evento.relatedTarget)) setAberto(false);
            }}
          >
            <button
              ref={(node) => {
                botaoRef.current = node;
                refBotaoEditar?.(node);
              }}
              id={`${menuId}-botao`}
              className="botao tarefa-card__gatilho"
              type="button"
              aria-label={`Ações da tarefa ${tarefa.titulo}`}
              aria-haspopup="menu"
              aria-expanded={aberto}
              aria-controls={aberto ? menuId : undefined}
              onClick={() => {
                if (aberto) fecharComFoco();
                else setAberto(true);
              }}
            >
              <span aria-hidden="true">⋯</span>
            </button>
            {aberto && (
              <div
                ref={menuRef}
                id={menuId}
                className="tarefa-card__menu"
                role="menu"
                aria-labelledby={`${menuId}-botao`}
                onKeyDown={tratarTecla}
              >
                <button
                  ref={editarRef}
                  className="botao"
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() => {
                    fecharComFoco();
                    onEditar(tarefa);
                  }}
                >
                  Editar
                </button>
                <button
                  ref={excluirRef}
                  className="botao tarefa-card__excluir"
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() => {
                    fecharComFoco();
                    onExcluir(tarefa);
                  }}
                >
                  Excluir
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="tarefa-card__detalhes">
          <span className={`tarefa-card__tag tarefa-card__estado--${tarefa.estado}`}>
            Estado: <strong>{ROTULO_ESTADO[tarefa.estado]}</strong>
          </span>
          <span className={`tarefa-card__tag tarefa-card__prioridade--${tarefa.prioridade}`}>
            Prioridade: <strong>{ROTULO_PRIORIDADE[tarefa.prioridade]}</strong>
          </span>
        </div>
      </article>
    </li>
  );
}

export default ItemTarefa;
export type { ItemTarefaProps };
