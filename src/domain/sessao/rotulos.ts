import type { Fase, StatusSessao } from "./tipos";

export const ROTULO_FASE: Record<Fase, string> = {
  foco: "Foco",
  pausaCurta: "Pausa curta",
  pausaLonga: "Pausa longa",
};

export const ROTULO_STATUS_SESSAO: Record<StatusSessao, string> = {
  emAndamento: "Em andamento",
  pausada: "Pausada",
  concluida: "Concluída",
};
