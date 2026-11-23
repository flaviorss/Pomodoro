import { gerarId } from "../domain/id";
import { ordenarTarefas } from "../domain/tarefa/ordenacao";
import { atualizarTarefa, criarTarefa } from "../domain/tarefa/tarefa";
import type {
  EntradaTarefa,
  ErrosTarefa,
  Tarefa,
} from "../domain/tarefa/tipos";
import { ehListaTarefas, validarDadosTarefa } from "../domain/tarefa/validacao";
import { CHAVE_TAREFAS } from "../storage/chaves";
import { useLocalStorage } from "./useLocalStorage";

type FalhaOperacaoTarefa =
  | { sucesso: false; motivo: "validacao"; erros: ErrosTarefa }
  | {
      sucesso: false;
      motivo: "naoEncontrada" | "persistencia";
      mensagem: string;
    };

export type ResultadoOperacaoTarefa = { sucesso: true } | FalhaOperacaoTarefa;

export type UseTarefas = {
  // Já ordenadas (estado derivado, calculado na renderização).
  tarefas: Tarefa[];
  erro: string | null;
  criar: (entrada: EntradaTarefa) => ResultadoOperacaoTarefa;
  editar: (id: string, entrada: EntradaTarefa) => ResultadoOperacaoTarefa;
  excluir: (id: string) => ResultadoOperacaoTarefa;
};

const TAREFA_NAO_ENCONTRADA = "A tarefa informada não foi encontrada.";

function resultadoPersistencia(erro: string | null): ResultadoOperacaoTarefa {
  if (erro !== null) {
    return { sucesso: false, motivo: "persistencia", mensagem: erro };
  }

  return { sucesso: true };
}

export function useTarefas(): UseTarefas {
  const [listaBruta, atualizarLista, erro] = useLocalStorage<Tarefa[]>(
    CHAVE_TAREFAS,
    [],
    ehListaTarefas,
  );

  const tarefas = ordenarTarefas(listaBruta);

  function criar(entrada: EntradaTarefa): ResultadoOperacaoTarefa {
    const resultado = validarDadosTarefa(entrada);
    if (!resultado.valido) {
      return { sucesso: false, motivo: "validacao", erros: resultado.erros };
    }

    const tarefa = criarTarefa(resultado.dados, gerarId(), Date.now());
    const erroAoSalvar = atualizarLista((anteriores) => [...anteriores, tarefa]);
    return resultadoPersistencia(erroAoSalvar);
  }

  function editar(id: string, entrada: EntradaTarefa): ResultadoOperacaoTarefa {
    const tarefaAtual = listaBruta.find((t) => t.id === id);
    if (tarefaAtual === undefined) {
      return { sucesso: false, motivo: "naoEncontrada", mensagem: TAREFA_NAO_ENCONTRADA };
    }

    const resultado = validarDadosTarefa(entrada);
    if (!resultado.valido) {
      return { sucesso: false, motivo: "validacao", erros: resultado.erros };
    }

    const tarefaEditada = atualizarTarefa(tarefaAtual, resultado.dados, Date.now());
    const erroAoSalvar = atualizarLista((anteriores) =>
      anteriores.map((t) => (t.id === id ? tarefaEditada : t)),
    );
    return resultadoPersistencia(erroAoSalvar);
  }

  function excluir(id: string): ResultadoOperacaoTarefa {
    const tarefaAtual = listaBruta.find((t) => t.id === id);
    if (tarefaAtual === undefined) {
      return { sucesso: false, motivo: "naoEncontrada", mensagem: TAREFA_NAO_ENCONTRADA };
    }

    const erroAoSalvar = atualizarLista((anteriores) =>
      anteriores.filter((t) => t.id !== id),
    );
    return resultadoPersistencia(erroAoSalvar);
  }

  return { tarefas, erro, criar, editar, excluir };
}
