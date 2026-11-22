import {
  useState,
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
  type JSX,
} from "react";
import { LIMITES } from "../../domain/limites";
import { ROTULO_ESTADO, ROTULO_PRIORIDADE } from "../../domain/tarefa/rotulos";
import {
  ESTADOS_TAREFA,
  PRIORIDADES_TAREFA,
  DADOS_PADRAO_TAREFA,
  type CampoTarefa,
  type DadosTarefa,
  type ErrosTarefa,
  type Tarefa,
} from "../../domain/tarefa/tipos";
import { validarDadosTarefa } from "../../domain/tarefa/validacao";
import type { ResultadoOperacaoTarefa } from "../../hooks/useTarefas";

type ValoresFormulario = Record<CampoTarefa, string>;

type FormularioTarefaProps = {
  tarefa?: Tarefa;
  onSalvar: (dados: DadosTarefa) => ResultadoOperacaoTarefa;
  onCancelar: () => void;
};

const VALORES_INICIAIS: ValoresFormulario = {
  titulo: DADOS_PADRAO_TAREFA.titulo,
  estado: DADOS_PADRAO_TAREFA.estado,
  prioridade: DADOS_PADRAO_TAREFA.prioridade,
};

function valoresDaTarefa(tarefa?: Tarefa): ValoresFormulario {
  if (tarefa === undefined) return VALORES_INICIAIS;

  return {
    titulo: tarefa.titulo,
    estado: tarefa.estado,
    prioridade: tarefa.prioridade,
  };
}

function FormularioTarefa({
  tarefa,
  onSalvar,
  onCancelar,
}: FormularioTarefaProps): JSX.Element {
  const [valores, setValores] = useState(() => valoresDaTarefa(tarefa));
  const [erros, setErros] = useState<ErrosTarefa>({});
  const [camposVisitados, setCamposVisitados] = useState<Set<CampoTarefa>>(
    () => new Set(),
  );
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const editando = tarefa !== undefined;
  const validacao = validarDadosTarefa(valores);
  const formularioValido = validacao.valido;

  function atualizarCampo(
    evento: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void {
    const campo = evento.target.name as CampoTarefa;
    const novosValores = { ...valores, [campo]: evento.target.value };
    setValores(novosValores);

    if (camposVisitados.has(campo)) {
      const resultado = validarDadosTarefa(novosValores);
      setErros((atuais) => ({
        ...atuais,
        [campo]: resultado.valido ? undefined : resultado.erros[campo],
      }));
    }
    setErroGeral(null);
  }

  function validarCampo(
    evento: FocusEvent<HTMLInputElement | HTMLSelectElement>,
  ): void {
    const campo = evento.target.name as CampoTarefa;
    setCamposVisitados((atuais) => new Set(atuais).add(campo));
    setErros((atuais) => ({
      ...atuais,
      [campo]: validacao.valido ? undefined : validacao.erros[campo],
    }));
  }

  function enviar(evento: FormEvent<HTMLFormElement>): void {
    evento.preventDefault();

    if (!validacao.valido) {
      setCamposVisitados(new Set(Object.keys(validacao.erros) as CampoTarefa[]));
      setErros(validacao.erros);
      return;
    }

    const resultado = onSalvar(validacao.dados);

    if (resultado.sucesso) return;
    if (resultado.motivo === "validacao") {
      setErros(resultado.erros);
      setErroGeral(null);
      return;
    }

    setErros({});
    if (resultado.motivo === "persistencia") return;
    setErroGeral(resultado.mensagem);
  }

  return (
    <section className="tarefa-formulario" aria-labelledby="titulo-formulario-tarefa">
      <div className="tarefa-formulario__cabecalho">
        <h3 id="titulo-formulario-tarefa">
          {editando ? "Editar tarefa" : "Nova tarefa"}
        </h3>
      </div>

      {erroGeral !== null && (
        <p className="mensagem mensagem--erro" role="alert">
          {erroGeral}
        </p>
      )}

      <form className="tarefa-formulario__campos" onSubmit={enviar} noValidate>
        <div className="campo campo--titulo">
          <label htmlFor="tarefa-titulo">Título</label>
          <input
            id="tarefa-titulo"
            name="titulo"
            type="text"
            value={valores.titulo}
            maxLength={LIMITES.tarefa.titulo.max}
            aria-invalid={erros.titulo !== undefined}
            aria-describedby={erros.titulo === undefined ? undefined : "erro-tarefa-titulo"}
            onChange={atualizarCampo}
            onBlur={validarCampo}
            autoFocus
          />
          {erros.titulo !== undefined && (
            <span id="erro-tarefa-titulo" className="campo__erro">
              {erros.titulo}
            </span>
          )}
        </div>

        <div className="campo">
          <label htmlFor="tarefa-estado">Estado</label>
          <select
            id="tarefa-estado"
            name="estado"
            value={valores.estado}
            aria-invalid={erros.estado !== undefined}
            aria-describedby={erros.estado === undefined ? undefined : "erro-tarefa-estado"}
            onChange={atualizarCampo}
            onBlur={validarCampo}
          >
            {ESTADOS_TAREFA.map((estado) => (
              <option key={estado} value={estado}>
                {ROTULO_ESTADO[estado]}
              </option>
            ))}
          </select>
          {erros.estado !== undefined && (
            <span id="erro-tarefa-estado" className="campo__erro">
              {erros.estado}
            </span>
          )}
        </div>

        <div className="campo">
          <label htmlFor="tarefa-prioridade">Prioridade</label>
          <select
            id="tarefa-prioridade"
            name="prioridade"
            value={valores.prioridade}
            aria-invalid={erros.prioridade !== undefined}
            aria-describedby={
              erros.prioridade === undefined ? undefined : "erro-tarefa-prioridade"
            }
            onChange={atualizarCampo}
            onBlur={validarCampo}
          >
            {PRIORIDADES_TAREFA.map((prioridade) => (
              <option key={prioridade} value={prioridade}>
                {ROTULO_PRIORIDADE[prioridade]}
              </option>
            ))}
          </select>
          {erros.prioridade !== undefined && (
            <span id="erro-tarefa-prioridade" className="campo__erro">
              {erros.prioridade}
            </span>
          )}
        </div>

        <div className="tarefa-formulario__acoes">
          <button
            className="botao botao--primario"
            type="submit"
            disabled={!formularioValido}
          >
            {editando ? "Salvar alterações" : "Salvar tarefa"}
          </button>
          <button className="botao botao--secundario" type="button" onClick={onCancelar}>
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}

export default FormularioTarefa;
export type { FormularioTarefaProps };
