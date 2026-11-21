import { describe, expect, it } from "vitest";
import { LIMITES } from "../limites";
import type { EntradaTarefa, Tarefa } from "./tipos";
import {
  ehDadosTarefa,
  ehListaTarefas,
  ehTarefa,
  normalizarDadosTarefa,
  validarDadosTarefa,
} from "./validacao";

const DADOS_VALIDOS: EntradaTarefa = {
  titulo: "Comprar leite",
  estado: "backlog",
  prioridade: "media",
};

const TAREFA_VALIDA: Tarefa = {
  id: "tarefa-1",
  titulo: "Comprar leite",
  estado: "backlog",
  prioridade: "media",
  criadaEm: 1000,
  atualizadaEm: 1100,
};

describe("normalizarDadosTarefa", () => {
  it("remove espaços externos do título sem alterar a entrada", () => {
    const entrada = { ...DADOS_VALIDOS, titulo: "  Tarefa  " };
    expect(normalizarDadosTarefa(entrada)).toEqual({ ...DADOS_VALIDOS, titulo: "Tarefa" });
    expect(entrada.titulo).toBe("  Tarefa  ");
  });
});

describe("validarDadosTarefa", () => {
  it("valida uma tarefa correta", () => {
    const resultado = validarDadosTarefa(DADOS_VALIDOS);
    expect(resultado.valido).toBe(true);
    if (resultado.valido) {
      expect(resultado.dados).toEqual(DADOS_VALIDOS);
    }
  });

  it.each(["", "   "])("rejeita título obrigatório representado por %j", (titulo) => {
    const resultado = validarDadosTarefa({ ...DADOS_VALIDOS, titulo });
    expect(resultado).toEqual({
      valido: false,
      erros: { titulo: "Informe um título para a tarefa." },
    });
  });

  it("rejeita título acima do limite máximo", () => {
    const limiteMax = LIMITES.tarefa.titulo.max;
    const resultado = validarDadosTarefa({
      ...DADOS_VALIDOS,
      titulo: "a".repeat(limiteMax + 1),
    });
    expect(resultado).toEqual({
      valido: false,
      erros: { titulo: `O título deve ter no máximo ${limiteMax} caracteres.` },
    });
  });

  it.each([1, 100])("aceita título com %i caracteres (limites)", (tamanho) => {
    const resultado = validarDadosTarefa({
      ...DADOS_VALIDOS,
      titulo: "a".repeat(tamanho),
    });
    expect(resultado.valido).toBe(true);
  });

  it("rejeita estado inválido", () => {
    const resultado = validarDadosTarefa({ ...DADOS_VALIDOS, estado: "invalido" });
    expect(resultado).toEqual({
      valido: false,
      erros: { estado: "O estado da tarefa é inválido." },
    });
  });

  it("rejeita prioridade inválida", () => {
    const resultado = validarDadosTarefa({ ...DADOS_VALIDOS, prioridade: "invalida" });
    expect(resultado).toEqual({
      valido: false,
      erros: { prioridade: "A prioridade da tarefa é inválida." },
    });
  });

  it("devolve os dados válidos com o título normalizado", () => {
    const resultado = validarDadosTarefa({ ...DADOS_VALIDOS, titulo: "  Comprar leite  " });
    expect(resultado).toEqual({ valido: true, dados: DADOS_VALIDOS });
  });
});

describe("guards de tarefa", () => {
  it("reconhece dados e entidades válidas", () => {
    expect(ehDadosTarefa(DADOS_VALIDOS)).toBe(true);
    expect(ehTarefa(TAREFA_VALIDA)).toBe(true);
    expect(ehListaTarefas([TAREFA_VALIDA])).toBe(true);
  });

  it("rejeita dados com título não normalizado (Decisão D3)", () => {
    expect(ehDadosTarefa({ ...DADOS_VALIDOS, titulo: " Comprar leite " })).toBe(false);
  });

  it("rejeita tarefa com id inválido ou inconsistência temporal", () => {
    expect(ehTarefa({ ...TAREFA_VALIDA, id: "  " })).toBe(false);
    expect(ehTarefa({ ...TAREFA_VALIDA, atualizadaEm: 900 })).toBe(false);
  });

  it("rejeita lista com identificadores duplicados", () => {
    expect(ehListaTarefas([TAREFA_VALIDA, { ...TAREFA_VALIDA }])).toBe(false);
  });

  it("rejeita lista com item inválido", () => {
    const invalida = { ...TAREFA_VALIDA, titulo: "" };
    expect(ehListaTarefas([TAREFA_VALIDA, invalida])).toBe(false);
  });
});
