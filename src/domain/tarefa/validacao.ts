import { LIMITES } from "../limites";
import {
  ESTADOS_TAREFA,
  PRIORIDADES_TAREFA,
  type DadosTarefa,
  type EntradaTarefa,
  type ErrosTarefa,
  type EstadoTarefa,
  type PrioridadeTarefa,
  type ResultadoValidacaoTarefa,
  type Tarefa,
} from "./tipos";

const MENSAGENS = {
  tituloObrigatorio: "Informe um título para a tarefa.",
  tituloMaximo: `O título deve ter no máximo ${LIMITES.tarefa.titulo.max} caracteres.`,
  estadoInvalido: "O estado da tarefa é inválido.",
  prioridadeInvalida: "A prioridade da tarefa é inválida.",
} as const;

function ehRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

function ehTimestamp(valor: unknown): valor is number {
  return typeof valor === "number" && Number.isFinite(valor) && valor >= 0;
}

/**
 * Normaliza os dados de uma tarefa, aplicando trim no título.
 */
export function normalizarDadosTarefa(dados: EntradaTarefa): EntradaTarefa {
  return {
    ...dados,
    titulo: typeof dados.titulo === "string" ? dados.titulo.trim() : dados.titulo,
  };
}

/**
 * Valida os dados de uma tarefa (título, estado e prioridade).
 */
export function validarDadosTarefa(dados: EntradaTarefa): ResultadoValidacaoTarefa {
  const normalizados = normalizarDadosTarefa(dados);
  const erros: ErrosTarefa = {};
  const titulo = normalizados.titulo;

  if (typeof titulo !== "string" || titulo.length < LIMITES.tarefa.titulo.min) {
    erros.titulo = MENSAGENS.tituloObrigatorio;
  } else if (titulo.length > LIMITES.tarefa.titulo.max) {
    erros.titulo = MENSAGENS.tituloMaximo;
  }

  if (
    !ESTADOS_TAREFA.includes(normalizados.estado as EstadoTarefa)
  ) {
    erros.estado = MENSAGENS.estadoInvalido;
  }

  if (
    !PRIORIDADES_TAREFA.includes(normalizados.prioridade as PrioridadeTarefa)
  ) {
    erros.prioridade = MENSAGENS.prioridadeInvalida;
  }

  if (Object.keys(erros).length > 0) return { valido: false, erros };

  return {
    valido: true,
    dados: {
      titulo: normalizados.titulo as string,
      estado: normalizados.estado as EstadoTarefa,
      prioridade: normalizados.prioridade as PrioridadeTarefa,
    },
  };
}

/**
 * Type guard para DadosTarefa. Rejeita títulos com espaços nas pontas (Decisão D3).
 */
export function ehDadosTarefa(valor: unknown): valor is DadosTarefa {
  if (!ehRegistro(valor)) return false;

  const resultado = validarDadosTarefa(valor);
  return resultado.valido && resultado.dados.titulo === valor.titulo;
}

/**
 * Type guard para Tarefa (entidade persistida).
 */
export function ehTarefa(valor: unknown): valor is Tarefa {
  if (!ehRegistro(valor) || !ehDadosTarefa(valor)) return false;
  const tarefa = valor as Record<string, unknown>;

  return (
    typeof tarefa.id === "string" &&
    tarefa.id.trim().length > 0 &&
    ehTimestamp(tarefa.criadaEm) &&
    ehTimestamp(tarefa.atualizadaEm) &&
    tarefa.atualizadaEm >= tarefa.criadaEm
  );
}

/**
 * Type guard para uma lista de tarefas, garantindo IDs únicos.
 */
export function ehListaTarefas(valor: unknown): valor is Tarefa[] {
  if (!Array.isArray(valor)) return false;

  const ids = new Set<string>();

  for (const tarefa of valor) {
    if (!ehTarefa(tarefa) || ids.has(tarefa.id)) return false;
    ids.add(tarefa.id);
  }

  return true;
}
