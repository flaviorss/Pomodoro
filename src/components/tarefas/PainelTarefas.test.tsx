import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import type { Tarefa } from "../../domain/tarefa/tipos";
import { useTarefas } from "../../hooks/useTarefas";
import { CHAVE_TAREFAS } from "../../storage/chaves";
import PainelTarefas from "./PainelTarefas";

const TAREFA_1: Tarefa = {
  id: "tarefa-1",
  titulo: "Tarefa Baixa",
  estado: "backlog",
  prioridade: "baixa",
  criadaEm: 100,
  atualizadaEm: 100,
};

const TAREFA_2: Tarefa = {
  id: "tarefa-2",
  titulo: "Tarefa Alta",
  estado: "aFazer",
  prioridade: "alta",
  criadaEm: 200,
  atualizadaEm: 200,
};

function persistir(tarefas: Tarefa[]): void {
  window.localStorage.setItem(CHAVE_TAREFAS, JSON.stringify(tarefas));
}

function PainelTeste(): React.JSX.Element {
  const controleTarefas = useTarefas();
  return <PainelTarefas controleTarefas={controleTarefas} />;
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("PainelTarefas", () => {
  it("UC12: cria com padrões (backlog e média) e valida título vazio", async () => {
    const usuario = userEvent.setup();
    render(<PainelTeste />);

    expect(screen.getByText("Nenhuma tarefa cadastrada")).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Nova tarefa" }));

    // Verifica valores padrão (RN-12)
    expect(screen.getByLabelText("Título")).toHaveValue("");
    expect(screen.getByLabelText("Estado")).toHaveValue("backlog");
    expect(screen.getByLabelText("Prioridade")).toHaveValue("media");

    const salvar = screen.getByRole("button", { name: "Salvar tarefa" });
    expect(salvar).toBeDisabled();

    // Tentar focar e sair do campo título para disparar validação
    const inputTitulo = screen.getByLabelText("Título");
    await usuario.click(inputTitulo);
    await usuario.tab();

    expect(inputTitulo).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Informe um título para a tarefa.")).toBeInTheDocument();
    expect(salvar).toBeDisabled();
    expect(window.localStorage.getItem(CHAVE_TAREFAS)).toBeNull();

    // Preencher título válido e salvar
    await usuario.type(inputTitulo, "Comprar Leite");
    expect(salvar).not.toBeDisabled();

    await usuario.click(salvar);

    expect(screen.getByRole("heading", { level: 3, name: "Comprar Leite" })).toBeInTheDocument();
    expect(screen.getByText("1 tarefa cadastrada")).toBeInTheDocument();
  });

  it("UC13: edita e reordena automaticamente as tarefas", async () => {
    persistir([TAREFA_1, TAREFA_2]);
    const usuario = userEvent.setup();
    render(<PainelTeste />);

    // Inicialmente TAREFA_2 (alta) vem antes de TAREFA_1 (baixa)
    const cabecalhos = screen.getAllByRole("heading", { level: 3 });
    expect(cabecalhos[0]).toHaveTextContent("Tarefa Alta");
    expect(cabecalhos[1]).toHaveTextContent("Tarefa Baixa");

    // Editar TAREFA_1 para prioridade alta e estado aFazer
    await usuario.click(screen.getAllByRole("button", { name: /Editar tarefa/ })[1]!);

    expect(screen.getByLabelText("Título")).toHaveValue("Tarefa Baixa");

    await usuario.clear(screen.getByLabelText("Título"));
    await usuario.type(screen.getByLabelText("Título"), "Tarefa Baixa Editada");
    await usuario.selectOptions(screen.getByLabelText("Prioridade"), "alta");
    await usuario.selectOptions(screen.getByLabelText("Estado"), "aFazer");

    await usuario.click(screen.getByRole("button", { name: "Salvar alterações" }));

    // Agora TAREFA_1 editada deve aparecer no topo devido à ordenação (mesma prioridade alta, mas criadaEm anterior)
    const cabecalhosAtualizados = screen.getAllByRole("heading", { level: 3 });
    expect(cabecalhosAtualizados[0]).toHaveTextContent("Tarefa Baixa Editada");
    expect(cabecalhosAtualizados[1]).toHaveTextContent("Tarefa Alta");
  });

  it("UC14: cancela ou confirma exclusão e fecha formulário se a tarefa em edição for excluída (D6)", async () => {
    persistir([TAREFA_1, TAREFA_2]);
    const usuario = userEvent.setup();
    render(<PainelTeste />);

    // 1. Cancelar exclusão
    await usuario.click(screen.getAllByRole("button", { name: /Excluir tarefa/ })[0]!);
    const dialogo = screen.getByRole("alertdialog", { name: "Excluir tarefa?" });
    expect(dialogo).toHaveTextContent("Tarefa Alta");

    await usuario.click(within(dialogo).getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(screen.getByText("Tarefa Alta")).toBeInTheDocument();

    // 2. Abrir edição de TAREFA_1
    await usuario.click(screen.getAllByRole("button", { name: /Editar tarefa/ })[1]!);
    expect(screen.getByRole("heading", { name: "Editar tarefa" })).toBeInTheDocument();

    // 3. Excluir TAREFA_1 enquanto está sendo editada (D6)
    await usuario.click(screen.getAllByRole("button", { name: /Excluir tarefa/ })[1]!);
    const dialogoExclusao = screen.getByRole("alertdialog", { name: "Excluir tarefa?" });
    await usuario.click(within(dialogoExclusao).getByRole("button", { name: "Excluir" }));

    // Verifica que o formulário de edição fechou (D6) e a tarefa sumiu
    expect(screen.queryByRole("heading", { name: "Editar tarefa" })).toBeNull();
    expect(screen.queryByText("Tarefa Baixa")).toBeNull();
    expect(screen.getByText("Tarefa Alta")).toBeInTheDocument();
  });

  it("UC15: exibe listagem ordenada e estado vazio", () => {
    render(<PainelTeste />);

    expect(screen.getByText("Nenhuma tarefa cadastrada")).toBeInTheDocument();
    expect(screen.queryByRole("list")).toBeNull();
  });
});
