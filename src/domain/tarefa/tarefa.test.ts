import { describe, expect, it } from "vitest";
import { DADOS_PADRAO_TAREFA, type DadosTarefa, type Tarefa } from "./tipos";
import { criarTarefa, atualizarTarefa, editarTarefa } from "./tarefa";

const DADOS_EXEMPLO: DadosTarefa = {
  titulo: "Estudar TypeScript",
  estado: "aFazer",
  prioridade: "alta",
};

const TAREFA_EXEMPLO: Tarefa = {
  id: "tarefa-1",
  titulo: "Estudar TypeScript",
  estado: "aFazer",
  prioridade: "alta",
  criadaEm: 100,
  atualizadaEm: 100,
};

describe("criarTarefa", () => {
  it("cria a entidade preenchendo corretamente id, dados e timestamps iguais", () => {
    const agora = 500;
    const tarefa = criarTarefa(DADOS_EXEMPLO, "t-123", agora);

    expect(tarefa).toEqual({
      id: "t-123",
      titulo: DADOS_EXEMPLO.titulo,
      estado: DADOS_EXEMPLO.estado,
      prioridade: DADOS_EXEMPLO.prioridade,
      criadaEm: agora,
      atualizadaEm: agora,
    });
    expect(tarefa.criadaEm).toBe(tarefa.atualizadaEm);
    expect(tarefa.criadaEm).toBe(agora);
  });

  it("cria tarefa utilizando DADOS_PADRAO_TAREFA (backlog e media, RN-12)", () => {
    const agora = 1000;
    const tarefa = criarTarefa(DADOS_PADRAO_TAREFA, "t-padrao", agora);

    expect(tarefa).toEqual({
      id: "t-padrao",
      titulo: "",
      estado: "backlog",
      prioridade: "media",
      criadaEm: agora,
      atualizadaEm: agora,
    });
  });
});

describe("atualizarTarefa", () => {
  it("atualiza título, estado, prioridade e atualizadaEm, preservando id e criadaEm", () => {
    const novosDados: DadosTarefa = {
      titulo: "Refatorar Domínio",
      estado: "emExecucao",
      prioridade: "alta",
    };
    const agora = 300;
    const tarefaAtualizada = atualizarTarefa(TAREFA_EXEMPLO, novosDados, agora);

    expect(tarefaAtualizada).toEqual({
      id: "tarefa-1",
      titulo: "Refatorar Domínio",
      estado: "emExecucao",
      prioridade: "alta",
      criadaEm: 100,
      atualizadaEm: 300,
    });
  });

  it("não altera o objeto original (imutabilidade)", () => {
    const novosDados: DadosTarefa = {
      titulo: "Outro Título",
      estado: "concluida",
      prioridade: "baixa",
    };
    const tarefaOriginalCopia = { ...TAREFA_EXEMPLO };

    atualizarTarefa(TAREFA_EXEMPLO, novosDados, 400);

    expect(TAREFA_EXEMPLO).toEqual(tarefaOriginalCopia);
  });

  it("suporta alias editarTarefa", () => {
    const novosDados: DadosTarefa = {
      titulo: "Teste Alias",
      estado: "aFazer",
      prioridade: "media",
    };
    const tarefaAtualizada = editarTarefa(TAREFA_EXEMPLO, novosDados, 200);

    expect(tarefaAtualizada.titulo).toBe("Teste Alias");
    expect(tarefaAtualizada.atualizadaEm).toBe(200);
  });
});
