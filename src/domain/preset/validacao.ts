import { LIMITES } from "../limites";
import type {
  DadosPreset,
  EntradaPreset,
  ErrosPreset,
  ResultadoValidacaoPreset,
  TemporizadorPersonalizado,
} from "./tipos";

const MENSAGENS = {
  nomeObrigatorio: "Informe um nome para o preset.",
  nomeMaximo: `O nome deve ter no máximo ${LIMITES.preset.nome.max} caracteres.`,
  tempoFocoMin: `O tempo de foco deve ser um número inteiro entre ${LIMITES.preset.tempoFocoMin.min} e ${LIMITES.preset.tempoFocoMin.max} minutos.`,
  tempoPausaCurtaMin: `O tempo de pausa curta deve ser um número inteiro entre ${LIMITES.preset.tempoPausaCurtaMin.min} e ${LIMITES.preset.tempoPausaCurtaMin.max} minutos.`,
  ciclosAntesPausaLonga: `A quantidade de ciclos deve ser um número inteiro entre ${LIMITES.preset.ciclosAntesPausaLonga.min} e ${LIMITES.preset.ciclosAntesPausaLonga.max}.`,
  tempoPausaLongaMin: `O tempo de pausa longa deve ser um número inteiro entre ${LIMITES.preset.tempoPausaLongaMin.min} e ${LIMITES.preset.tempoPausaLongaMin.max} minutos.`,
} as const;

function ehRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

function ehInteiroNoIntervalo(valor: unknown, minimo: number, maximo: number): boolean {
  return (
    typeof valor === "number" &&
    Number.isInteger(valor) &&
    valor >= minimo &&
    valor <= maximo
  );
}

function ehTimestamp(valor: unknown): valor is number {
  return typeof valor === "number" && Number.isFinite(valor) && valor >= 0;
}

export function normalizarDadosPreset(dados: EntradaPreset): EntradaPreset {
  return {
    ...dados,
    nome: typeof dados.nome === "string" ? dados.nome.trim() : dados.nome,
  };
}

export function validarDadosPreset(dados: EntradaPreset): ResultadoValidacaoPreset {
  const normalizados = normalizarDadosPreset(dados);
  const erros: ErrosPreset = {};
  const nome = normalizados.nome;

  if (typeof nome !== "string" || nome.length < LIMITES.preset.nome.min) {
    erros.nome = MENSAGENS.nomeObrigatorio;
  } else if (nome.length > LIMITES.preset.nome.max) {
    erros.nome = MENSAGENS.nomeMaximo;
  }

  if (
    !ehInteiroNoIntervalo(
      normalizados.tempoFocoMin,
      LIMITES.preset.tempoFocoMin.min,
      LIMITES.preset.tempoFocoMin.max,
    )
  ) {
    erros.tempoFocoMin = MENSAGENS.tempoFocoMin;
  }

  if (
    !ehInteiroNoIntervalo(
      normalizados.tempoPausaCurtaMin,
      LIMITES.preset.tempoPausaCurtaMin.min,
      LIMITES.preset.tempoPausaCurtaMin.max,
    )
  ) {
    erros.tempoPausaCurtaMin = MENSAGENS.tempoPausaCurtaMin;
  }

  if (
    !ehInteiroNoIntervalo(
      normalizados.ciclosAntesPausaLonga,
      LIMITES.preset.ciclosAntesPausaLonga.min,
      LIMITES.preset.ciclosAntesPausaLonga.max,
    )
  ) {
    erros.ciclosAntesPausaLonga = MENSAGENS.ciclosAntesPausaLonga;
  }

  if (
    !ehInteiroNoIntervalo(
      normalizados.tempoPausaLongaMin,
      LIMITES.preset.tempoPausaLongaMin.min,
      LIMITES.preset.tempoPausaLongaMin.max,
    )
  ) {
    erros.tempoPausaLongaMin = MENSAGENS.tempoPausaLongaMin;
  }

  if (Object.keys(erros).length > 0) return { valido: false, erros };

  return {
    valido: true,
    dados: {
      nome: normalizados.nome as string,
      tempoFocoMin: normalizados.tempoFocoMin as number,
      tempoPausaCurtaMin: normalizados.tempoPausaCurtaMin as number,
      ciclosAntesPausaLonga: normalizados.ciclosAntesPausaLonga as number,
      tempoPausaLongaMin: normalizados.tempoPausaLongaMin as number,
    },
  };
}

export function ehDadosPreset(valor: unknown): valor is DadosPreset {
  if (!ehRegistro(valor)) return false;

  const resultado = validarDadosPreset(valor);
  return resultado.valido && resultado.dados.nome === valor.nome;
}

export function ehTemporizadorPersonalizado(
  valor: unknown,
): valor is TemporizadorPersonalizado {
  if (!ehRegistro(valor) || !ehDadosPreset(valor)) return false;
  const preset = valor as Record<string, unknown>;

  return (
    typeof preset.id === "string" &&
    preset.id.trim().length > 0 &&
    ehTimestamp(preset.criadoEm) &&
    ehTimestamp(preset.atualizadoEm) &&
    preset.atualizadoEm >= preset.criadoEm
  );
}

export function ehListaPresets(valor: unknown): valor is TemporizadorPersonalizado[] {
  if (!Array.isArray(valor)) return false;

  const ids = new Set<string>();

  for (const preset of valor) {
    if (!ehTemporizadorPersonalizado(preset) || ids.has(preset.id)) return false;
    ids.add(preset.id);
  }

  return true;
}
