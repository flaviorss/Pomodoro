import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DadosPreset, TemporizadorPersonalizado } from "./domain/preset/tipos";
import { encerrar, iniciarSessao } from "./domain/sessao/sessao";
import type { SessaoAtiva } from "./domain/sessao/tipos";
import { CHAVE_PRESETS, CHAVE_SESSAO_ATIVA } from "./storage/chaves";
import App from "./App";

const DADOS_ESTUDO: DadosPreset = {
  nome: "Estudo",
  tempoFocoMin: 25,
  tempoPausaCurtaMin: 5,
  ciclosAntesPausaLonga: 4,
  tempoPausaLongaMin: 15,
};

const PRESET_ESTUDO: TemporizadorPersonalizado = {
  id: "preset-estudo",
  ...DADOS_ESTUDO,
  criadoEm: 100,
  atualizadoEm: 100,
};

const PRESET_LEITURA: TemporizadorPersonalizado = {
  id: "preset-leitura",
  nome: "Leitura",
  tempoFocoMin: 50,
  tempoPausaCurtaMin: 10,
  ciclosAntesPausaLonga: 2,
  tempoPausaLongaMin: 20,
  criadoEm: 200,
  atualizadoEm: 200,
};

function persistirPresets(): void {
  window.localStorage.setItem(
    CHAVE_PRESETS,
    JSON.stringify([PRESET_ESTUDO, PRESET_LEITURA]),
  );
}

function obterSessaoPersistida(): SessaoAtiva {
  return JSON.parse(
    window.localStorage.getItem(CHAVE_SESSAO_ATIVA) ?? "null",
  ) as SessaoAtiva;
}

function itemDoPreset(nome: string): HTMLElement {
  const titulo = screen.getByRole("heading", { level: 3, name: nome });
  const item = titulo.closest("article");

  if (item === null) throw new Error(`Item do preset ${nome} não encontrado.`);
  return item;
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("App", () => {
  it("renderiza o título da aplicação", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Pomodoro" })).toBeInTheDocument();
  });

  it("inicia uma sessão com o preset e seu snapshot", async () => {
    persistirPresets();
    const usuario = userEvent.setup();
    render(<App />);

    expect(screen.getByText("2 temporizadores cadastrados")).toBeInTheDocument();
    await usuario.click(
      within(itemDoPreset("Estudo")).getByRole("button", { name: "Iniciar" }),
    );

    const sessao = obterSessaoPersistida();
    expect(sessao).toMatchObject({
      presetId: PRESET_ESTUDO.id,
      snapshotPreset: DADOS_ESTUDO,
      status: "emAndamento",
    });
    expect(screen.getByRole("heading", { name: "Sessão ativa" })).toBeInTheDocument();
    expect(within(itemDoPreset("Estudo")).getByText("Em uso")).toBeInTheDocument();
  });

  it("troca a sessão automaticamente sem alterar os presets", async () => {
    persistirPresets();
    const presetsAntes = window.localStorage.getItem(CHAVE_PRESETS);
    const usuario = userEvent.setup();
    render(<App />);

    await usuario.click(
      within(itemDoPreset("Estudo")).getByRole("button", { name: "Iniciar" }),
    );
    const primeiraSessao = obterSessaoPersistida();

    await usuario.click(
      within(itemDoPreset("Leitura")).getByRole("button", {
        name: "Trocar Para Este Preset",
      }),
    );

    const segundaSessao = obterSessaoPersistida();
    expect(segundaSessao.id).not.toBe(primeiraSessao.id);
    expect(segundaSessao.presetId).toBe(PRESET_LEITURA.id);
    expect(segundaSessao.snapshotPreset).toEqual({
      nome: PRESET_LEITURA.nome,
      tempoFocoMin: PRESET_LEITURA.tempoFocoMin,
      tempoPausaCurtaMin: PRESET_LEITURA.tempoPausaCurtaMin,
      ciclosAntesPausaLonga: PRESET_LEITURA.ciclosAntesPausaLonga,
      tempoPausaLongaMin: PRESET_LEITURA.tempoPausaLongaMin,
    });
    expect(window.localStorage.getItem(CHAVE_PRESETS)).toBe(presetsAntes);
    expect(within(itemDoPreset("Leitura")).getByText("Em uso")).toBeInTheDocument();
  });

  it("não reinicia a sessão ao acionar o preset que já está em uso", async () => {
    persistirPresets();
    const usuario = userEvent.setup();
    render(<App />);

    await usuario.click(
      within(itemDoPreset("Estudo")).getByRole("button", { name: "Iniciar" }),
    );
    const sessaoAntes = obterSessaoPersistida();
    const indicacaoEmUso = within(itemDoPreset("Estudo")).getByText("Em uso");

    expect(
      within(itemDoPreset("Estudo")).queryByRole("button", { name: /Iniciar|Trocar/ }),
    ).toBeNull();
    await usuario.click(indicacaoEmUso);

    expect(obterSessaoPersistida()).toEqual(sessaoAntes);
  });

  it("libera o preset de uma sessão concluída e preserva o snapshot ao editar", async () => {
    persistirPresets();
    const sessaoConcluida = encerrar(iniciarSessao(PRESET_ESTUDO, 1_000), 2_000);
    window.localStorage.setItem(CHAVE_SESSAO_ATIVA, JSON.stringify(sessaoConcluida));
    const usuario = userEvent.setup();
    render(<App />);

    const item = itemDoPreset("Estudo");
    expect(within(item).getByRole("button", { name: "Editar" })).toBeEnabled();
    expect(within(item).getByRole("button", { name: "Excluir" })).toBeEnabled();

    await usuario.click(within(item).getByRole("button", { name: "Editar" }));
    await usuario.clear(screen.getByLabelText("Nome"));
    await usuario.type(screen.getByLabelText("Nome"), "Estudo atualizado");
    await usuario.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(obterSessaoPersistida().snapshotPreset).toEqual(DADOS_ESTUDO);
    expect(
      screen.getByRole("heading", { level: 3, name: "Estudo atualizado" }),
    ).toBeInTheDocument();
  });

  it("apresenta erros de sessão e presets separadamente", () => {
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new Error("falha simulada");
    });

    render(<App />);

    expect(screen.getAllByRole("alert")).toHaveLength(2);
    expect(
      screen.getByText("Temporizadores:").closest('[role="alert"]'),
    ).toHaveTextContent("Não foi possível ler os dados salvos neste navegador.");
    expect(screen.getByText("Sessão:").closest('[role="alert"]')).toHaveTextContent(
      "Não foi possível ler os dados salvos neste navegador.",
    );
  });
});
