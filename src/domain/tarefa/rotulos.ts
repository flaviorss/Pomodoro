import type { EstadoTarefa, PrioridadeTarefa } from "./tipos";

export const ROTULO_ESTADO: Record<EstadoTarefa, string> = {
  backlog: "Backlog",
  aFazer: "A fazer",
  emExecucao: "Em execução",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

export const ROTULO_PRIORIDADE: Record<PrioridadeTarefa, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};