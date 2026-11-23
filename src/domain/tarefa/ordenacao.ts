import type { EstadoTarefa, PrioridadeTarefa, Tarefa } from "./tipos";

/**
 * Decisão D1 (RN-10): Ordem de exibição dos estados.
 * Alterar esta constante para mudar a ordem globalmente.
 */
export const ORDEM_ESTADO: readonly EstadoTarefa[] = [
  "aFazer",
  "emExecucao",
  "concluida",
  "cancelada",
  "backlog",
];

const PESO_PRIORIDADE: Record<PrioridadeTarefa, number> = {
  alta: 0,
  media: 1,
  baixa: 2,
};

const PESO_ESTADO: Record<EstadoTarefa, number> = ORDEM_ESTADO.reduce(
  (acc, estado, index) => ({ ...acc, [estado]: index }),
  {} as Record<EstadoTarefa, number>,
);

/**
 * Ordena as tarefas de forma pura.
 * 1. Prioridade decrescente (alta > media > baixa).
 * 2. Estado conforme ORDEM_ESTADO (D1).
 * 3. Data de criação crescente (mais antigas primeiro - D2).
 */
export function ordenarTarefas(tarefas: readonly Tarefa[]): Tarefa[] {
  return [...tarefas].sort((a, b) => {
    // 1. Prioridade
    const diffPrioridade = PESO_PRIORIDADE[a.prioridade] - PESO_PRIORIDADE[b.prioridade];
    if (diffPrioridade !== 0) return diffPrioridade;

    // 2. Estado
    const diffEstado = PESO_ESTADO[a.estado] - PESO_ESTADO[b.estado];
    if (diffEstado !== 0) return diffEstado;

    // 3. Criada em (mais antiga primeiro)
    return a.criadaEm - b.criadaEm;
  });
}
