import type { DadosTarefa, Tarefa } from "./tipos";

/**
 * Cria uma nova entidade Tarefa com o ID, dados e timestamps fornecidos.
 */
export function criarTarefa(
  dados: DadosTarefa,
  id: string,
  agora: number,
): Tarefa {
  return {
    id,
    ...dados,
    criadaEm: agora,
    atualizadaEm: agora,
  };
}

/**
 * Atualiza uma tarefa existente, retornando uma nova cópia com os dados atualizados e timestamp atualizado.
 */
export function atualizarTarefa(
  tarefa: Tarefa,
  dados: DadosTarefa,
  agora: number,
): Tarefa {
  return {
    ...tarefa,
    ...dados,
    id: tarefa.id,
    criadaEm: tarefa.criadaEm,
    atualizadaEm: agora,
  };
}

/**
 * Alias para atualizarTarefa.
 */
export const editarTarefa = atualizarTarefa;
