import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState, type JSX } from "react";
import { describe, expect, it, vi } from "vitest";
import ConfirmDialog from "./ConfirmDialog";

function ExemploDialogo(): JSX.Element {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setAberto(true)}>
        Abrir diálogo
      </button>
      <ConfirmDialog
        aberto={aberto}
        titulo="Excluir temporizador?"
        mensagem="Esta ação não pode ser desfeita."
        textoConfirmar="Excluir"
        onConfirmar={() => setAberto(false)}
        onCancelar={() => setAberto(false)}
      />
    </>
  );
}

describe("ConfirmDialog", () => {
  it("possui nome acessível, mantém o foco dentro do diálogo e fecha com Escape", async () => {
    const usuario = userEvent.setup();
    render(<ExemploDialogo />);
    const abrir = screen.getByRole("button", { name: "Abrir diálogo" });

    await usuario.click(abrir);

    const dialogo = screen.getByRole("alertdialog", {
      name: "Excluir temporizador?",
    });
    const cancelar = within(dialogo).getByRole("button", { name: "Cancelar" });
    const confirmar = within(dialogo).getByRole("button", { name: "Excluir" });

    expect(document.body).toHaveStyle({ overflow: "hidden" });
    expect(cancelar).toHaveFocus();
    await usuario.tab();
    expect(confirmar).toHaveFocus();
    await usuario.tab();
    expect(cancelar).toHaveFocus();
    await usuario.tab({ shift: true });
    expect(confirmar).toHaveFocus();

    await usuario.keyboard("{Escape}");

    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(abrir).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
  });

  it("pode ser dispensado ao clicar fora do conteúdo", () => {
    const cancelar = vi.fn();
    render(
      <ConfirmDialog
        aberto
        titulo="Excluir temporizador?"
        mensagem="Esta ação não pode ser desfeita."
        onConfirmar={vi.fn()}
        onCancelar={cancelar}
      />,
    );
    const dialogo = screen.getByRole("alertdialog");

    fireEvent.mouseDown(dialogo.parentElement as HTMLElement);

    expect(cancelar).toHaveBeenCalledOnce();
  });
});
