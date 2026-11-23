import { describe, expect, it } from "vitest";
import type { EstadoTarefa, PrioridadeTarefa, Tarefa } from "./tipos";
import { ordenarTarefas, ORDEM_ESTADO } from "./ordenacao";

function criarTarefa(
  id: string,
  prioridade: PrioridadeTarefa,
  estado: EstadoTarefa,
  criadaEm: number,
): Tarefa {
  return {
    id,
    titulo: `Tarefa ${id}`,
    prioridade,
    estado,
    criadaEm,
    atualizadaEm: criadaEm,
  };
}

describe("ordenarTarefas", () => {
  it("ordena por prioridade isoladamente (alta > media > baixa)", () => {
    const t1 = criarTarefa("1", "baixa", "aFazer", 100);
    const t2 = criarTarefa("2", "alta", "aFazer", 100);
    const t3 = criarTarefa("3", "media", "aFazer", 100);

    const resultado = ordenarTarefas([t1, t2, t3]);
    expect(resultado.map((t) => t.id)).toEqual(["2", "3", "1"]);
  });

  it("ordena por estado isoladamente conforme ORDEM_ESTADO (D1)", () => {
    const tarefas = ORDEM_ESTADO.slice().reverse().map((estado, index) => 
      criarTarefa(index.toString(), "media", estado, 100)
    );

    const resultado = ordenarTarefas(tarefas);
    expect(resultado.map((t) => t.estado)).toEqual([...ORDEM_ESTADO]);
  });

  it("ordena por data de criação como desempate (D2 - mais antiga primeiro)", () => {
    const t1 = criarTarefa("1", "media", "aFazer", 200);
    const t2 = criarTarefa("2", "media", "aFazer", 100);
    const t3 = criarTarefa("3", "media", "aFazer", 300);

    const resultado = ordenarTarefas([t1, t2, t3]);
    expect(resultado.map((t) => t.id)).toEqual(["2", "1", "3"]);
  });

  it("garante a ordem correta para todas as 15 combinações de prioridade e estado", () => {
    const prioridades: PrioridadeTarefa[] = ["baixa", "media", "alta"];
    const todas: Tarefa[] = [];

    // Gerar todas as combinações em ordem aleatória/embaralhada
    prioridades.forEach((p) => {
      ORDEM_ESTADO.forEach((e) => {
        todas.push(criarTarefa(`${p}-${e}`, p, e, 100));
      });
    });

    const resultado = ordenarTarefas(todas.reverse());

    // A ordem esperada é: todas as 'alta' (na ordem de ORDEM_ESTADO), 
    // depois todas as 'media', depois todas as 'baixa'.
    const ordemEsperada = [
      ...ORDEM_ESTADO.map((e) => `alta-${e}`),
      ...ORDEM_ESTADO.map((e) => `media-${e}`),
      ...ORDEM_ESTADO.map((e) => `baixa-${e}`),
    ];

    expect(resultado.map((t) => t.id)).toEqual(ordemEsperada);
  });

  it("é uma função pura e não altera o array original", () => {
    const t1 = criarTarefa("1", "baixa", "backlog", 100);
    const t2 = criarTarefa("2", "alta", "aFazer", 50);
    const original = [t1, t2];
    const originalCongelado = [...original];

    ordenarTarefas(original);
    expect(original).toEqual(originalCongelado);
  });

  it("lida corretamente com listas vazias ou com um único item", () => {
    expect(ordenarTarefas([])).toEqual([]);
    
    const t1 = criarTarefa("1", "media", "aFazer", 100);
    expect(ordenarTarefas([t1])).toEqual([t1]);
  });
});
