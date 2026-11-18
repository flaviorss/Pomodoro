export const LIMITES = {
  preset: {
    nome: { min: 1, max: 40 },
    tempoFocoMin: { min: 1, max: 120 },
    tempoPausaCurtaMin: { min: 1, max: 60 },
    ciclosAntesPausaLonga: { min: 1, max: 12 },
    tempoPausaLongaMin: { min: 1, max: 60 },
  },
  tarefa: {
    titulo: { min: 1, max: 100 },
  },
} as const;

export const TAREFA_PADRAO = {
  estado: "backlog",
  prioridade: "media",
} as const;
