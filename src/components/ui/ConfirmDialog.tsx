import {
  useEffect,
  useId,
  useRef,
  type JSX,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

type ConfirmDialogProps = {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  onConfirmar: () => void;
  onCancelar: () => void;
};

const ELEMENTOS_FOCAVEIS =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function ConfirmDialog({
  aberto,
  titulo,
  mensagem,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  onConfirmar,
  onCancelar,
}: ConfirmDialogProps): JSX.Element | null {
  const tituloId = useId();
  const mensagemId = useId();
  const dialogoRef = useRef<HTMLDivElement>(null);
  const cancelarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aberto) return;

    const focoAnterior =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    cancelarRef.current?.focus();

    return () => {
      if (focoAnterior?.isConnected) focoAnterior.focus();
    };
  }, [aberto]);

  if (!aberto) return null;

  function tratarTecla(evento: KeyboardEvent<HTMLDivElement>): void {
    if (evento.key === "Escape") {
      evento.preventDefault();
      evento.stopPropagation();
      onCancelar();
      return;
    }

    if (evento.key !== "Tab") return;

    const elementos = Array.from(
      dialogoRef.current?.querySelectorAll<HTMLElement>(ELEMENTOS_FOCAVEIS) ?? [],
    );
    const primeiro = elementos[0];
    const ultimo = elementos.at(-1);

    if (primeiro === undefined || ultimo === undefined) return;

    if (evento.shiftKey && document.activeElement === primeiro) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primeiro.focus();
    }
  }

  function dispensar(evento: MouseEvent<HTMLDivElement>): void {
    if (evento.target === evento.currentTarget) onCancelar();
  }

  return (
    <div className="dialogo-fundo" onMouseDown={dispensar} onKeyDown={tratarTecla}>
      <div
        ref={dialogoRef}
        className="dialogo-confirmacao"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        aria-describedby={mensagemId}
      >
        <h2 id={tituloId}>{titulo}</h2>
        <p id={mensagemId}>{mensagem}</p>

        <div className="dialogo-confirmacao__acoes">
          <button
            ref={cancelarRef}
            className="botao botao--secundario"
            type="button"
            onClick={onCancelar}
          >
            {textoCancelar}
          </button>
          <button className="botao botao--perigo" type="button" onClick={onConfirmar}>
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}

export type { ConfirmDialogProps };
export default ConfirmDialog;
