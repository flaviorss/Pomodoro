import type { DadosTarefa, Tarefa } from "../domain/tarefa/tipos";

export type UseTarefas = {
  // Já ordenadas (estado derivado, calculado na renderização).
  tarefas: Tarefa[];
  criar: (dados: DadosTarefa) => void;
  editar: (id: string, dados: DadosTarefa) => void;
  excluir: (id: string) => void;
};

export function useTarefas(): UseTarefas {
  return { tarefas: [], criar: () => {}, editar: () => {}, excluir: () => {} };
}
