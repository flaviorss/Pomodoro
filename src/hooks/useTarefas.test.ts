import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DadosTarefa, Tarefa } from "../domain/tarefa/tipos";
import { CHAVE_TAREFAS } from "../storage/chaves";
import { useTarefas, type ResultadoOperacaoTarefa } from "./useTarefas";

const DADOS_TAREFA: DadosTarefa = {
  titulo: "Comprar Café",
  estado: "aFazer",
  prioridade: "media",
};

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

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useTarefas", () => {
  it("restaura uma lista válida do localStorage já retornada ordenada", () => {
    // TAREFA_1 tem prioridade baixa, TAREFA_2 tem prioridade alta.
    // ordenarTarefas deve colocar TAREFA_2 antes de TAREFA_1.
    persistir([TAREFA_1, TAREFA_2]);

    const { result } = renderHook(() => useTarefas());

    expect(result.current.tarefas).toEqual([TAREFA_2, TAREFA_1]);
    expect(result.current.erro).toBeNull();
  });

  it.each(["{", JSON.stringify([{ ...TAREFA_1, prioridade: "invalida" }])])(
    "descarta dados corrompidos no localStorage com mensagem de erro (R-03)",
    (valorPersistido) => {
      window.localStorage.setItem(CHAVE_TAREFAS, valorPersistido);

      const { result } = renderHook(() => useTarefas());

      expect(result.current.tarefas).toEqual([]);
      expect(result.current.erro).toBe(
        "Os dados salvos estavam inconsistentes e foram descartados.",
      );
      expect(window.localStorage.getItem(CHAVE_TAREFAS)).toBeNull();
    },
  );

  it("expõe falha de leitura do armazenamento", () => {
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new Error("falha simulada");
    });

    const { result } = renderHook(() => useTarefas());

    expect(result.current.tarefas).toEqual([]);
    expect(result.current.erro).toBe(
      "Não foi possível ler os dados salvos neste navegador.",
    );
  });

  it("cria, persiste e reordena automaticamente as tarefas", () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);
    const { result } = renderHook(() => useTarefas());
    let operacao: ResultadoOperacaoTarefa | undefined;

    act(() => {
      operacao = result.current.criar({
        titulo: "  Nova Tarefa Alta  ",
        estado: "aFazer",
        prioridade: "alta",
      });
    });

    expect(operacao).toEqual({ sucesso: true });
    expect(result.current.tarefas).toHaveLength(1);
    expect(result.current.tarefas[0]).toMatchObject({
      titulo: "Nova Tarefa Alta",
      estado: "aFazer",
      prioridade: "alta",
      criadaEm: 1_000,
      atualizadaEm: 1_000,
    });
    expect(result.current.tarefas[0]?.id).toBeTruthy();
    expect(JSON.parse(window.localStorage.getItem(CHAVE_TAREFAS) ?? "null")).toEqual(
      result.current.tarefas,
    );
  });

  it("edita com sucesso, persiste e reordena a lista", () => {
    persistir([TAREFA_1, TAREFA_2]);
    vi.useFakeTimers();
    vi.setSystemTime(500);
    const { result } = renderHook(() => useTarefas());
    let operacao: ResultadoOperacaoTarefa | undefined;

    // Edit TAREFA_1 to be high priority and 'aFazer' state so it sorts to the top
    act(() => {
      operacao = result.current.editar(TAREFA_1.id, {
        titulo: "Tarefa Baixa Editada",
        estado: "aFazer",
        prioridade: "alta",
      });
    });

    expect(operacao).toEqual({ sucesso: true });
    expect(result.current.tarefas[0]?.id).toBe(TAREFA_1.id);
    expect(result.current.tarefas[0]?.prioridade).toBe("alta");
    expect(result.current.tarefas[0]?.atualizadaEm).toBe(500);
  });

  it("exclui com sucesso e persiste a lista atualizada", () => {
    persistir([TAREFA_1, TAREFA_2]);
    const { result } = renderHook(() => useTarefas());
    let operacao: ResultadoOperacaoTarefa | undefined;

    act(() => {
      operacao = result.current.excluir(TAREFA_1.id);
    });

    expect(operacao).toEqual({ sucesso: true });
    expect(result.current.tarefas).toEqual([TAREFA_2]);
    expect(JSON.parse(window.localStorage.getItem(CHAVE_TAREFAS) ?? "null")).toEqual([
      TAREFA_2,
    ]);
  });

  it("rejeita dados inválidos retornando erros por campo sem gravar no storage", () => {
    const { result } = renderHook(() => useTarefas());
    let operacao: ResultadoOperacaoTarefa | undefined;

    act(() => {
      operacao = result.current.criar({
        titulo: "",
        estado: "estadoInvalido" as DadosTarefa["estado"],
        prioridade: "alta",
      });
    });

    expect(operacao).toMatchObject({
      sucesso: false,
      motivo: "validacao",
    });
    expect(result.current.tarefas).toEqual([]);
    expect(window.localStorage.getItem(CHAVE_TAREFAS)).toBeNull();
  });

  it("trata ID inexistente (naoEncontrada) na edição e exclusão", () => {
    persistir([TAREFA_1]);
    const { result } = renderHook(() => useTarefas());

    expect(result.current.editar("inexistente", DADOS_TAREFA)).toEqual({
      sucesso: false,
      motivo: "naoEncontrada",
      mensagem: "A tarefa informada não foi encontrada.",
    });
    expect(result.current.excluir("inexistente")).toEqual({
      sucesso: false,
      motivo: "naoEncontrada",
      mensagem: "A tarefa informada não foi encontrada.",
    });
    expect(result.current.tarefas).toEqual([TAREFA_1]);
  });

  it("expõe falha na gravação do localStorage (persistencia, RNF-06)", () => {
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new Error("falha simulada");
    });
    const { result } = renderHook(() => useTarefas());
    let operacao: ResultadoOperacaoTarefa | undefined;

    act(() => {
      operacao = result.current.criar(DADOS_TAREFA);
    });

    expect(operacao).toEqual({
      sucesso: false,
      motivo: "persistencia",
      mensagem: "Não foi possível salvar os dados neste navegador.",
    });
    expect(result.current.erro).toBe("Não foi possível salvar os dados neste navegador.");
  });
});
