import type React from "react";

type ConfirmDialogProps = {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  // Padrão: "Confirmar".
  textoConfirmar?: string;
  // Padrão: "Cancelar".
  textoCancelar?: string;
  onConfirmar: () => void;
  onCancelar: () => void;
};

function ConfirmDialog(_props: ConfirmDialogProps): React.JSX.Element | null {
  // Implementação real na Parte 4.
  return null;
}

export type { ConfirmDialogProps };
export default ConfirmDialog;
