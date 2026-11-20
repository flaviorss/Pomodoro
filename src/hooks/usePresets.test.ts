import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DadosPreset, TemporizadorPersonalizado } from "../domain/preset/tipos";
import { obterPresetEmUsoId } from "../domain/sessao/sessao";
import type { SessaoAtiva, StatusSessao } from "../domain/sessao/tipos";
import { CHAVE_PRESETS } from "../storage/chaves";
import { usePresets, type ResultadoOperacaoPreset } from "./usePresets";

const DADOS: DadosPreset = {
  nome: "Estudo",
  tempoFocoMin: 25,
  tempoPausaCurtaMin: 5,
  ciclosAntesPausaLonga: 4,
  tempoPausaLongaMin: 15,
};

const PRESET_1: TemporizadorPersonalizado = {
  id: "preset-1",
  ...DADOS,
  criadoEm: 100,
  atualizadoEm: 100,
};

const PRESET_2: TemporizadorPersonalizado = {
  id: "preset-2",
  ...DADOS,
  nome: "Leitura",
  criadoEm: 200,
  atualizadoEm: 200,
};

function criarSessao(status: StatusSessao): SessaoAtiva {
  const pausada = status === "pausada";

  return {
    id: "sessao-1",
    presetId: PRESET_1.id,
    snapshotPreset: DADOS,
    faseAtual: "foco",
    cicloAtual: 1,
    focoConcluidoNoCiclo: false,
    status,
    inicioFaseEm: 100,
    fimFasePrevistoEm: 1_500_100,
    pausadaEm: pausada ? 200 : null,
    tempoRestanteAoPausarMs: pausada ? 1_499_900 : null,
    criadaEm: 100,
    atualizadaEm: 200,
  };
}

function persistir(presets: TemporizadorPersonalizado[]): void {
  window.localStorage.setItem(CHAVE_PRESETS, JSON.stringify(presets));
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("usePresets", () => {
  it("restaura uma lista válida", () => {
    persistir([PRESET_1, PRESET_2]);

    const { result } = renderHook(() => usePresets());

    expect(result.current.presets).toEqual([PRESET_1, PRESET_2]);
    expect(result.current.erro).toBeNull();
  });

  it.each(["{", JSON.stringify([{ ...PRESET_1, tempoFocoMin: 0 }])])(
    "descarta dados persistidos inconsistentes",
    (valorPersistido) => {
      window.localStorage.setItem(CHAVE_PRESETS, valorPersistido);

      const { result } = renderHook(() => usePresets());

      expect(result.current.presets).toEqual([]);
      expect(result.current.erro).toBe(
        "Os dados salvos estavam inconsistentes e foram descartados.",
      );
      expect(window.localStorage.getItem(CHAVE_PRESETS)).toBeNull();
    },
  );

  it("expõe falha de leitura do armazenamento", () => {
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new Error("falha simulada");
    });

    const { result } = renderHook(() => usePresets());

    expect(result.current.presets).toEqual([]);
    expect(result.current.erro).toBe(
      "Não foi possível ler os dados salvos neste navegador.",
    );
  });

  it("cria e persiste um preset normalizado", () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);
    const { result } = renderHook(() => usePresets());
    let operacao: ResultadoOperacaoPreset | undefined;

    act(() => {
      operacao = result.current.criar({ ...DADOS, nome: "  Estudo  " });
    });

    expect(operacao).toEqual({ sucesso: true });
    expect(result.current.presets).toHaveLength(1);
    expect(result.current.presets[0]).toMatchObject({
      ...DADOS,
      nome: "Estudo",
      criadoEm: 1_000,
      atualizadoEm: 1_000,
    });
    expect(result.current.presets[0]?.id).toBeTruthy();
    expect(JSON.parse(window.localStorage.getItem(CHAVE_PRESETS) ?? "null")).toEqual(
      result.current.presets,
    );
  });

  it("restaura a lista após remontar o hook", () => {
    const primeiro = renderHook(() => usePresets());

    act(() => {
      primeiro.result.current.criar(DADOS);
    });
    const listaCriada = primeiro.result.current.presets;
    primeiro.unmount();

    const segundo = renderHook(() => usePresets());

    expect(segundo.result.current.presets).toEqual(listaCriada);
  });

  it("edita somente o preset informado e preserva sua criação", () => {
    persistir([PRESET_1, PRESET_2]);
    vi.useFakeTimers();
    vi.setSystemTime(500);
    const { result } = renderHook(() => usePresets());
    let operacao: ResultadoOperacaoPreset | undefined;

    act(() => {
      operacao = result.current.editar(PRESET_1.id, {
        ...DADOS,
        nome: "Redação",
        tempoFocoMin: 50,
      });
    });

    expect(operacao).toEqual({ sucesso: true });
    expect(result.current.presets).toEqual([
      {
        ...PRESET_1,
        nome: "Redação",
        tempoFocoMin: 50,
        criadoEm: 100,
        atualizadoEm: 500,
      },
      PRESET_2,
    ]);
    expect(JSON.parse(window.localStorage.getItem(CHAVE_PRESETS) ?? "null")).toEqual(
      result.current.presets,
    );
  });

  it("exclui somente o preset informado", () => {
    persistir([PRESET_1, PRESET_2]);
    const { result } = renderHook(() => usePresets());
    let operacao: ResultadoOperacaoPreset | undefined;

    act(() => {
      operacao = result.current.excluir(PRESET_1.id);
    });

    expect(operacao).toEqual({ sucesso: true });
    expect(result.current.presets).toEqual([PRESET_2]);
    expect(JSON.parse(window.localStorage.getItem(CHAVE_PRESETS) ?? "null")).toEqual([
      PRESET_2,
    ]);
  });

  it("devolve erros de campo sem persistir dados inválidos", () => {
    const { result } = renderHook(() => usePresets());
    let operacao: ResultadoOperacaoPreset | undefined;

    act(() => {
      operacao = result.current.criar({ ...DADOS, tempoFocoMin: 0 });
    });

    expect(operacao).toEqual({
      sucesso: false,
      motivo: "validacao",
      erros: {
        tempoFocoMin: "O tempo de foco deve ser um número inteiro entre 1 e 120 minutos.",
      },
    });
    expect(result.current.presets).toEqual([]);
    expect(window.localStorage.getItem(CHAVE_PRESETS)).toBeNull();
  });

  it("recusa edição e exclusão de ID inexistente", () => {
    persistir([PRESET_1]);
    const { result } = renderHook(() => usePresets());

    expect(result.current.editar("inexistente", DADOS)).toEqual({
      sucesso: false,
      motivo: "naoEncontrado",
      mensagem: "O temporizador informado não foi encontrado.",
    });
    expect(result.current.excluir("inexistente")).toEqual({
      sucesso: false,
      motivo: "naoEncontrado",
      mensagem: "O temporizador informado não foi encontrado.",
    });
    expect(result.current.presets).toEqual([PRESET_1]);
    expect(JSON.parse(window.localStorage.getItem(CHAVE_PRESETS) ?? "null")).toEqual([
      PRESET_1,
    ]);
  });

  it("expõe falha de persistência na operação e no hook", () => {
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new Error("falha simulada");
    });
    const { result } = renderHook(() => usePresets());
    let operacao: ResultadoOperacaoPreset | undefined;

    act(() => {
      operacao = result.current.criar(DADOS);
    });

    expect(operacao).toEqual({
      sucesso: false,
      motivo: "persistencia",
      mensagem: "Não foi possível salvar os dados neste navegador.",
    });
    expect(result.current.erro).toBe("Não foi possível salvar os dados neste navegador.");
  });

  it.each(["emAndamento", "pausada"] as const)(
    "bloqueia edição e exclusão durante sessão %s",
    (status) => {
      persistir([PRESET_1, PRESET_2]);
      const presetEmUsoId = obterPresetEmUsoId(criarSessao(status));
      const gravar = vi.spyOn(window.localStorage, "setItem");
      const { result } = renderHook(() => usePresets(presetEmUsoId));

      expect(result.current.editar(PRESET_1.id, { ...DADOS, nome: "Redação" })).toEqual({
        sucesso: false,
        motivo: "bloqueado",
        mensagem:
          "Este temporizador está em uso por uma sessão ativa e não pode ser editado.",
      });
      expect(result.current.excluir(PRESET_1.id)).toEqual({
        sucesso: false,
        motivo: "bloqueado",
        mensagem:
          "Este temporizador está em uso por uma sessão ativa e não pode ser excluído.",
      });
      expect(result.current.presets).toEqual([PRESET_1, PRESET_2]);
      expect(gravar).not.toHaveBeenCalled();
    },
  );

  it("libera edição e exclusão quando a sessão está concluída", () => {
    persistir([PRESET_1]);
    const presetEmUsoId = obterPresetEmUsoId(criarSessao("concluida"));
    const { result } = renderHook(() => usePresets(presetEmUsoId));

    act(() => {
      expect(result.current.editar(PRESET_1.id, { ...DADOS, nome: "Redação" })).toEqual({
        sucesso: true,
      });
    });
    act(() => {
      expect(result.current.excluir(PRESET_1.id)).toEqual({ sucesso: true });
    });

    expect(result.current.presets).toEqual([]);
  });

  it("mantém outros presets editáveis e excluíveis durante uma sessão ativa", () => {
    persistir([PRESET_1, PRESET_2]);
    const presetEmUsoId = obterPresetEmUsoId(criarSessao("emAndamento"));
    const { result } = renderHook(() => usePresets(presetEmUsoId));

    act(() => {
      expect(result.current.editar(PRESET_2.id, { ...DADOS, nome: "Redação" })).toEqual({
        sucesso: true,
      });
    });
    act(() => {
      expect(result.current.excluir(PRESET_2.id)).toEqual({ sucesso: true });
    });

    expect(result.current.presets).toEqual([PRESET_1]);
  });
});
