import {
  useState,
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
  type JSX,
} from "react";
import { LIMITES } from "../../domain/limites";
import type {
  CampoPreset,
  EntradaPreset,
  ErrosPreset,
  TemporizadorPersonalizado,
} from "../../domain/preset/tipos";
import { validarDadosPreset } from "../../domain/preset/validacao";
import type { ResultadoOperacaoPreset } from "../../hooks/usePresets";

type ValoresFormulario = Record<CampoPreset, string>;

type FormularioPresetProps = {
  preset?: TemporizadorPersonalizado;
  onSalvar: (dados: EntradaPreset) => ResultadoOperacaoPreset;
  onCancelar: () => void;
};

const VALORES_INICIAIS: ValoresFormulario = {
  nome: "",
  tempoFocoMin: "",
  tempoPausaCurtaMin: "",
  ciclosAntesPausaLonga: "",
  tempoPausaLongaMin: "",
};

function valoresDoPreset(preset?: TemporizadorPersonalizado): ValoresFormulario {
  if (preset === undefined) return VALORES_INICIAIS;

  return {
    nome: preset.nome,
    tempoFocoMin: String(preset.tempoFocoMin),
    tempoPausaCurtaMin: String(preset.tempoPausaCurtaMin),
    ciclosAntesPausaLonga: String(preset.ciclosAntesPausaLonga),
    tempoPausaLongaMin: String(preset.tempoPausaLongaMin),
  };
}

function numeroOuValorVazio(valor: string): number | string {
  return valor.trim() === "" ? "" : Number(valor);
}

function entradaDosValores(valores: ValoresFormulario): EntradaPreset {
  return {
    nome: valores.nome,
    tempoFocoMin: numeroOuValorVazio(valores.tempoFocoMin),
    tempoPausaCurtaMin: numeroOuValorVazio(valores.tempoPausaCurtaMin),
    ciclosAntesPausaLonga: numeroOuValorVazio(valores.ciclosAntesPausaLonga),
    tempoPausaLongaMin: numeroOuValorVazio(valores.tempoPausaLongaMin),
  };
}

function FormularioPreset({
  preset,
  onSalvar,
  onCancelar,
}: FormularioPresetProps): JSX.Element {
  const [valores, setValores] = useState(() => valoresDoPreset(preset));
  const [erros, setErros] = useState<ErrosPreset>({});
  const [camposVisitados, setCamposVisitados] = useState<Set<CampoPreset>>(
    () => new Set(),
  );
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const editando = preset !== undefined;
  const validacao = validarDadosPreset(entradaDosValores(valores));
  const formularioValido = validacao.valido;

  function atualizarCampo(evento: ChangeEvent<HTMLInputElement>): void {
    const campo = evento.target.name as CampoPreset;
    setValores((atuais) => ({ ...atuais, [campo]: evento.target.value }));
    if (camposVisitados.has(campo)) {
      const proximosValores = { ...valores, [campo]: evento.target.value };
      const resultado = validarDadosPreset(entradaDosValores(proximosValores));
      setErros((atuais) => ({
        ...atuais,
        [campo]: resultado.valido ? undefined : resultado.erros[campo],
      }));
    }
    setErroGeral(null);
  }

  function validarCampo(evento: FocusEvent<HTMLInputElement>): void {
    const campo = evento.target.name as CampoPreset;
    setCamposVisitados((atuais) => new Set(atuais).add(campo));
    setErros((atuais) => ({
      ...atuais,
      [campo]: validacao.valido ? undefined : validacao.erros[campo],
    }));
  }

  function enviar(evento: FormEvent<HTMLFormElement>): void {
    evento.preventDefault();

    if (!validacao.valido) {
      setCamposVisitados(new Set(Object.keys(validacao.erros) as CampoPreset[]));
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
    <section className="preset-formulario" aria-labelledby="titulo-formulario-preset">
      <div className="preset-formulario__cabecalho">
        <h3 id="titulo-formulario-preset">
          {editando ? "Editar temporizador" : "Novo temporizador"}
        </h3>
      </div>

      {erroGeral !== null && (
        <p className="mensagem mensagem--erro" role="alert">
          {erroGeral}
        </p>
      )}

      <form className="preset-formulario__campos" onSubmit={enviar} noValidate>
        <div className="campo campo--nome">
          <label htmlFor="preset-nome">Nome</label>
          <input
            id="preset-nome"
            name="nome"
            type="text"
            value={valores.nome}
            maxLength={LIMITES.preset.nome.max}
            aria-invalid={erros.nome !== undefined}
            aria-describedby={erros.nome === undefined ? undefined : "erro-preset-nome"}
            onChange={atualizarCampo}
            onBlur={validarCampo}
            autoFocus
          />
          {erros.nome !== undefined && (
            <span id="erro-preset-nome" className="campo__erro">
              {erros.nome}
            </span>
          )}
        </div>

        <div className="campo">
          <label htmlFor="preset-foco">Tempo de foco (minutos)</label>
          <input
            id="preset-foco"
            name="tempoFocoMin"
            type="number"
            inputMode="numeric"
            min={LIMITES.preset.tempoFocoMin.min}
            max={LIMITES.preset.tempoFocoMin.max}
            step="1"
            value={valores.tempoFocoMin}
            aria-invalid={erros.tempoFocoMin !== undefined}
            aria-describedby={
              erros.tempoFocoMin === undefined ? undefined : "erro-preset-foco"
            }
            onChange={atualizarCampo}
            onBlur={validarCampo}
          />
          {erros.tempoFocoMin !== undefined && (
            <span id="erro-preset-foco" className="campo__erro">
              {erros.tempoFocoMin}
            </span>
          )}
        </div>

        <div className="campo">
          <label htmlFor="preset-pausa-curta">Pausa curta (minutos)</label>
          <input
            id="preset-pausa-curta"
            name="tempoPausaCurtaMin"
            type="number"
            inputMode="numeric"
            min={LIMITES.preset.tempoPausaCurtaMin.min}
            max={LIMITES.preset.tempoPausaCurtaMin.max}
            step="1"
            value={valores.tempoPausaCurtaMin}
            aria-invalid={erros.tempoPausaCurtaMin !== undefined}
            aria-describedby={
              erros.tempoPausaCurtaMin === undefined
                ? undefined
                : "erro-preset-pausa-curta"
            }
            onChange={atualizarCampo}
            onBlur={validarCampo}
          />
          {erros.tempoPausaCurtaMin !== undefined && (
            <span id="erro-preset-pausa-curta" className="campo__erro">
              {erros.tempoPausaCurtaMin}
            </span>
          )}
        </div>

        <div className="campo">
          <label htmlFor="preset-ciclos">Ciclos até a pausa longa</label>
          <input
            id="preset-ciclos"
            name="ciclosAntesPausaLonga"
            type="number"
            inputMode="numeric"
            min={LIMITES.preset.ciclosAntesPausaLonga.min}
            max={LIMITES.preset.ciclosAntesPausaLonga.max}
            step="1"
            value={valores.ciclosAntesPausaLonga}
            aria-invalid={erros.ciclosAntesPausaLonga !== undefined}
            aria-describedby={
              erros.ciclosAntesPausaLonga === undefined ? undefined : "erro-preset-ciclos"
            }
            onChange={atualizarCampo}
            onBlur={validarCampo}
          />
          {erros.ciclosAntesPausaLonga !== undefined && (
            <span id="erro-preset-ciclos" className="campo__erro">
              {erros.ciclosAntesPausaLonga}
            </span>
          )}
        </div>

        <div className="campo">
          <label htmlFor="preset-pausa-longa">Pausa longa (minutos)</label>
          <input
            id="preset-pausa-longa"
            name="tempoPausaLongaMin"
            type="number"
            inputMode="numeric"
            min={LIMITES.preset.tempoPausaLongaMin.min}
            max={LIMITES.preset.tempoPausaLongaMin.max}
            step="1"
            value={valores.tempoPausaLongaMin}
            aria-invalid={erros.tempoPausaLongaMin !== undefined}
            aria-describedby={
              erros.tempoPausaLongaMin === undefined
                ? undefined
                : "erro-preset-pausa-longa"
            }
            onChange={atualizarCampo}
            onBlur={validarCampo}
          />
          {erros.tempoPausaLongaMin !== undefined && (
            <span id="erro-preset-pausa-longa" className="campo__erro">
              {erros.tempoPausaLongaMin}
            </span>
          )}
        </div>

        <div className="preset-formulario__acoes">
          <button
            className="botao botao--primario"
            type="submit"
            disabled={!formularioValido}
          >
            {editando ? "Salvar alterações" : "Salvar temporizador"}
          </button>
          <button className="botao botao--secundario" type="button" onClick={onCancelar}>
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}

export default FormularioPreset;
export type { FormularioPresetProps };
