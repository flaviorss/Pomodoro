import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DadosPreset, TemporizadorPersonalizado } from "../../domain/preset/tipos";
import { usePresets } from "../../hooks/usePresets";
import { useSessao } from "../../hooks/useSessao";
import { CHAVE_PRESETS } from "../../storage/chaves";
import GerenciadorPresets from "./GerenciadorPresets";

const DADOS: DadosPreset = {
  nome: "Estudo",
  tempoFocoMin: 25,
  tempoPausaCurtaMin: 5,
  ciclosAntesPausaLonga: 4,
  tempoPausaLongaMin: 15,
};

const PRESET: TemporizadorPersonalizado = {
  id: "preset-1",
  ...DADOS,
  criadoEm: 100,
  atualizadoEm: 100,
};

function persistir(presets: TemporizadorPersonalizado[]): void {
  window.localStorage.setItem(CHAVE_PRESETS, JSON.stringify(presets));
}

function GerenciadorTeste({
  presetEmUsoId = null,
}: {
  presetEmUsoId?: string | null;
}): React.JSX.Element {
  const controlePresets = usePresets(presetEmUsoId);
  const controleSessao = useSessao();

  return (
    <GerenciadorPresets
      controlePresets={controlePresets}
      controleSessao={controleSessao}
      presetEmUsoId={presetEmUsoId}
    />
  );
}

async function preencherFormulario(
  usuario: ReturnType<typeof userEvent.setup>,
): Promise<void> {
  await usuario.type(screen.getByLabelText("Nome"), "Estudo");
  await usuario.type(screen.getByLabelText("Tempo de foco (minutos)"), "25");
  await usuario.type(screen.getByLabelText("Pausa curta (minutos)"), "5");
  await usuario.type(screen.getByLabelText("Ciclos até a pausa longa"), "4");
  await usuario.type(screen.getByLabelText("Pausa longa (minutos)"), "15");
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("GerenciadorPresets", () => {
  it("cria e exibe um temporizador válido", async () => {
    const usuario = userEvent.setup();
    render(<GerenciadorTeste />);

    await usuario.click(screen.getByRole("button", { name: "Novo temporizador" }));
    await preencherFormulario(usuario);
    await usuario.click(screen.getByRole("button", { name: "Salvar temporizador" }));

    expect(screen.getByRole("heading", { level: 3, name: "Estudo" })).toBeInTheDocument();
    expect(screen.getByText("25 min")).toBeInTheDocument();
    expect(screen.getByText("1 temporizador cadastrado")).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(CHAVE_PRESETS) ?? "null")).toEqual([
      expect.objectContaining(DADOS),
    ]);
  });

  it("mostra erros nos campos e impede a criação inválida", async () => {
    const usuario = userEvent.setup();
    render(<GerenciadorTeste />);

    await usuario.click(screen.getByRole("button", { name: "Novo temporizador" }));
    const salvar = screen.getByRole("button", { name: "Salvar temporizador" });

    expect(salvar).toBeDisabled();

    for (let indice = 0; indice < 5; indice += 1) {
      await usuario.tab();
    }

    expect(screen.getByLabelText("Nome")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Informe um nome para o temporizador.")).toBeInTheDocument();
    expect(
      screen.getByText(
        "O tempo de foco deve ser um número inteiro entre 1 e 120 minutos.",
      ),
    ).toBeInTheDocument();
    expect(salvar).toBeDisabled();
    expect(window.localStorage.getItem(CHAVE_PRESETS)).toBeNull();
  });

  it("cancela a criação sem persistir dados", async () => {
    const usuario = userEvent.setup();
    render(<GerenciadorTeste />);

    await usuario.click(screen.getByRole("button", { name: "Novo temporizador" }));
    await usuario.type(screen.getByLabelText("Nome"), "Rascunho");
    await usuario.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("heading", { name: "Novo temporizador" })).toBeNull();
    expect(window.localStorage.getItem(CHAVE_PRESETS)).toBeNull();
  });

  it("abre o formulário preenchido e salva a edição", async () => {
    persistir([PRESET]);
    const usuario = userEvent.setup();
    render(<GerenciadorTeste />);

    await usuario.click(screen.getByRole("button", { name: "Editar" }));
    expect(screen.getByLabelText("Nome")).toHaveValue("Estudo");
    expect(screen.getByLabelText("Tempo de foco (minutos)")).toHaveValue(25);

    await usuario.clear(screen.getByLabelText("Nome"));
    await usuario.type(screen.getByLabelText("Nome"), "Redação");
    await usuario.clear(screen.getByLabelText("Tempo de foco (minutos)"));
    await usuario.type(screen.getByLabelText("Tempo de foco (minutos)"), "50");
    await usuario.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(
      screen.getByRole("heading", { level: 3, name: "Redação" }),
    ).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(CHAVE_PRESETS) ?? "null")).toEqual([
      expect.objectContaining({ ...DADOS, nome: "Redação", tempoFocoMin: 50 }),
    ]);
  });

  it("cancela a edição preservando os dados anteriores", async () => {
    persistir([PRESET]);
    const usuario = userEvent.setup();
    render(<GerenciadorTeste />);

    await usuario.click(screen.getByRole("button", { name: "Editar" }));
    await usuario.clear(screen.getByLabelText("Nome"));
    await usuario.type(screen.getByLabelText("Nome"), "Rascunho");
    await usuario.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.getByRole("heading", { level: 3, name: "Estudo" })).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(CHAVE_PRESETS) ?? "null")).toEqual([
      PRESET,
    ]);
  });

  it("cancela a exclusão e mantém o preset", async () => {
    persistir([PRESET]);
    const usuario = userEvent.setup();
    render(<GerenciadorTeste />);

    await usuario.click(screen.getByRole("button", { name: "Excluir" }));
    const dialogo = screen.getByRole("alertdialog", {
      name: "Excluir temporizador?",
    });

    expect(dialogo).toHaveTextContent("Estudo");
    await usuario.click(within(dialogo).getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(screen.getByRole("heading", { level: 3, name: "Estudo" })).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(CHAVE_PRESETS) ?? "null")).toEqual([
      PRESET,
    ]);
  });

  it("confirma a exclusão e persiste a lista atualizada", async () => {
    persistir([PRESET]);
    const usuario = userEvent.setup();
    render(<GerenciadorTeste />);

    await usuario.click(screen.getByRole("button", { name: "Excluir" }));
    const dialogo = screen.getByRole("alertdialog", {
      name: "Excluir temporizador?",
    });
    await usuario.click(within(dialogo).getByRole("button", { name: "Excluir" }));

    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(screen.queryByRole("heading", { level: 3, name: "Estudo" })).toBeNull();
    expect(JSON.parse(window.localStorage.getItem(CHAVE_PRESETS) ?? "null")).toEqual([]);
  });

  it("bloqueia edição e exclusão do preset em uso com uma explicação visível", () => {
    persistir([PRESET]);

    render(<GerenciadorTeste presetEmUsoId={PRESET.id} />);

    expect(screen.getByRole("button", { name: "Editar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Excluir" })).toBeDisabled();
    expect(
      screen.getByText(
        "Encerre a sessão ativa para editar ou excluir este temporizador.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Em uso")).toBeInTheDocument();
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("recusa a exclusão se o preset entrar em uso com o diálogo aberto", async () => {
    persistir([PRESET]);
    const usuario = userEvent.setup();
    const { rerender } = render(<GerenciadorTeste />);

    await usuario.click(screen.getByRole("button", { name: "Excluir" }));
    rerender(<GerenciadorTeste presetEmUsoId={PRESET.id} />);

    const dialogo = screen.getByRole("alertdialog", {
      name: "Excluir temporizador?",
    });
    await usuario.click(within(dialogo).getByRole("button", { name: "Excluir" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Este temporizador está em uso por uma sessão ativa e não pode ser excluído.",
    );
    expect(screen.getByRole("heading", { level: 3, name: "Estudo" })).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(CHAVE_PRESETS) ?? "null")).toEqual([
      PRESET,
    ]);
  });

  it("apresenta falhas de persistência em uma região de alerta", () => {
    vi.spyOn(window.localStorage, "getItem").mockImplementation((chave) => {
      if (chave === CHAVE_PRESETS) throw new Error("falha simulada");
      return null;
    });

    render(<GerenciadorTeste />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível ler os dados salvos neste navegador.",
    );
  });
});
