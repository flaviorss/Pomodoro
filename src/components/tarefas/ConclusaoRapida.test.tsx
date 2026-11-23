import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it } from "vitest";
import type { Tarefa } from "../../domain/tarefa/tipos";
import { useTarefas } from "../../hooks/useTarefas";
import { CHAVE_TAREFAS } from "../../storage/chaves";
import PainelTarefas from "./PainelTarefas";

const tarefa: Tarefa = {
  id: "revisar",
  titulo: "Revisar relatório",
  prioridade: "alta",
  estado: "aFazer",
  criadaEm: 100,
  atualizadaEm: 100,
};
const outraTarefa: Tarefa = {
  ...tarefa,
  id: "enviar",
  titulo: "Enviar relatório",
  estado: "emExecucao",
  criadaEm: 200,
  atualizadaEm: 200,
};

function PainelTeste() {
  return <PainelTarefas controleTarefas={useTarefas()} />;
}

beforeEach(() => {
  window.localStorage.clear();
});

it("conclui pelo card, preserva os dados e mantém a ordenação ao recarregar", async () => {
  window.localStorage.setItem(CHAVE_TAREFAS, JSON.stringify([tarefa, outraTarefa]));
  const usuario = userEvent.setup();
  const { unmount } = render(<PainelTeste />);
  const titulos = () => screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
  const nome = "Concluir tarefa Revisar relatório";

  expect(titulos()).toEqual([tarefa.titulo, outraTarefa.titulo]);
  await usuario.tab();
  await usuario.tab();
  const checkbox = screen.getByRole("checkbox", { name: nome });
  expect(checkbox).toHaveFocus();
  expect(checkbox).not.toBeChecked();

  await usuario.keyboard(" ");

  expect(checkbox).toBeChecked();
  expect(screen.queryByRole("heading", { name: "Editar tarefa" })).not.toBeInTheDocument();
  expect(titulos()).toEqual([outraTarefa.titulo, tarefa.titulo]);
  const card = screen.getByRole("article", { name: tarefa.titulo });
  expect(within(card).getByText("Concluída")).toBeInTheDocument();
  expect(within(card).getByText("Alta")).toBeInTheDocument();
  expect(within(card).getByRole("button", { name: /ações da tarefa/i })).toHaveFocus();

  const gravadas = JSON.parse(window.localStorage.getItem(CHAVE_TAREFAS) ?? "[]");
  expect(gravadas).toEqual([
    { ...tarefa, estado: "concluida", atualizadaEm: expect.any(Number) },
    outraTarefa,
  ]);
  unmount();
  render(<PainelTeste />);

  expect(screen.getByRole("checkbox", { name: nome })).toBeChecked();
  expect(titulos()).toEqual([outraTarefa.titulo, tarefa.titulo]);
});

it("mantém uma tarefa já concluída marcada quando o estado anterior é desconhecido", async () => {
  const dados = JSON.stringify([{ ...tarefa, estado: "concluida" }]);
  window.localStorage.setItem(CHAVE_TAREFAS, dados);
  const usuario = userEvent.setup();
  render(<PainelTeste />);

  const checkbox = screen.getByRole("checkbox", { name: "Concluir tarefa Revisar relatório" });
  expect(checkbox).toBeDisabled();
  await usuario.click(checkbox);
  await usuario.keyboard(" ");

  expect(checkbox).toBeChecked();
  expect(window.localStorage.getItem(CHAVE_TAREFAS)).toBe(dados);
});
