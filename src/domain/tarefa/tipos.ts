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

// Estados possíveis de uma tarefa (constante para uso em lógica de negócio/UI).
export const ESTADOS_TAREFA: EstadoTarefa[] = [
  "backlog",
  "aFazer",
  "emExecucao",
  "concluida",
  "cancelada",
];

// Prioridades possíveis de uma tarefa (constante para uso em lógica de negócio/UI).
export const PRIORIDADES_TAREFA: PrioridadeTarefa[] = ["baixa", "media", "alta"];

// Dados padrão para uma nova tarefa.
export const DADOS_PADRAO_TAREFA: DadosTarefa = {
  titulo: "",
  estado: "backlog",
  prioridade: "media",
};

// Campos editáveis de uma tarefa.
export type CampoTarefa = keyof DadosTarefa;

// Dados brutos vindos de formulários (podem ser qualquer coisa).
export type EntradaTarefa = Partial<Record<CampoTarefa, unknown>>;

// Mensagens de erro por campo de tarefa.
export type ErrosTarefa = Partial<Record<CampoTarefa, string>>;

// Resultado da validação de uma tarefa.
export type ResultadoValidacaoTarefa =
  | { valido: true; dados: DadosTarefa }
  | { valido: false; erros: ErrosTarefa };
