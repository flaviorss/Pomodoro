import { ehDadosPreset } from "../preset/validacao";
import type { DadosPreset } from "../preset/tipos";
import type { Fase, SessaoAtiva, StatusSessao } from "./tipos";

const FASES: Fase[] = ["foco", "pausaCurta", "pausaLonga"];
const STATUS: StatusSessao[] = ["emAndamento", "pausada", "concluida"];

function ehInteiroNoIntervalo(
  valor: unknown,
  minimo: number,
  maximo: number,
): valor is number {
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

export function ehSessaoAtiva(valor: unknown): valor is SessaoAtiva {
  if (typeof valor !== "object" || valor === null) return false;

  const sessao = valor as Record<string, unknown>;
  const pausada = sessao.status === "pausada";

  return (
    typeof sessao.id === "string" &&
    sessao.id.length > 0 &&
    typeof sessao.presetId === "string" &&
    sessao.presetId.length > 0 &&
    ehDadosPreset(sessao.snapshotPreset) &&
    typeof sessao.faseAtual === "string" &&
    FASES.includes(sessao.faseAtual as Fase) &&
    ehInteiroNoIntervalo(
      sessao.cicloAtual,
      1,
      (sessao.snapshotPreset as DadosPreset).ciclosAntesPausaLonga,
    ) &&
    typeof sessao.focoConcluidoNoCiclo === "boolean" &&
    typeof sessao.status === "string" &&
    STATUS.includes(sessao.status as StatusSessao) &&
    ehTimestamp(sessao.inicioFaseEm) &&
    ehTimestamp(sessao.fimFasePrevistoEm) &&
    (sessao.pausadaEm === null || ehTimestamp(sessao.pausadaEm)) &&
    (sessao.tempoRestanteAoPausarMs === null ||
      (typeof sessao.tempoRestanteAoPausarMs === "number" &&
        Number.isFinite(sessao.tempoRestanteAoPausarMs) &&
        sessao.tempoRestanteAoPausarMs >= 0)) &&
    ehTimestamp(sessao.criadaEm) &&
    ehTimestamp(sessao.atualizadaEm) &&
    (pausada
      ? sessao.pausadaEm !== null && sessao.tempoRestanteAoPausarMs !== null
      : sessao.pausadaEm === null && sessao.tempoRestanteAoPausarMs === null)
  );
}
