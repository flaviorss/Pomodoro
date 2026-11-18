// Estados possíveis de uma tarefa.
export type EstadoTarefa =
  | "backlog"
  | "aFazer"
  | "emExecucao"
  | "concluida"
  | "cancelada";

// Prioridades possíveis de uma tarefa.
export type PrioridadeTarefa = "baixa" | "media" | "alta";

// Tarefa persistida no localStorage.
export type Tarefa = {
  id: string;
  titulo: string;
  estado: EstadoTarefa;
  prioridade: PrioridadeTarefa;
  criadaEm: number;
  atualizadaEm: number;
};

// Dados informados pelo usuário no formulário.
export type DadosTarefa = Pick<Tarefa, "titulo" | "estado" | "prioridade">;