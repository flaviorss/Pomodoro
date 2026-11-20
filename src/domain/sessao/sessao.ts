import { gerarId } from "../id";
import type { DadosPreset, TemporizadorPersonalizado } from "../preset/tipos";
import type { Fase, SessaoAtiva } from "./tipos";

const MINUTO_EM_MS = 60_000;

export function obterPresetEmUsoId(sessao: SessaoAtiva | null): string | null {
  if (sessao === null || sessao.status === "concluida") return null;
  return sessao.presetId;
}

function duracaoDaFase(sessao: SessaoAtiva, fase: Fase): number {
  const { snapshotPreset } = sessao;

  if (fase === "foco") return snapshotPreset.tempoFocoMin * MINUTO_EM_MS;
  if (fase === "pausaCurta") return snapshotPreset.tempoPausaCurtaMin * MINUTO_EM_MS;

  return snapshotPreset.tempoPausaLongaMin * MINUTO_EM_MS;
}

function proximaPausa(sessao: SessaoAtiva): Fase {
  return sessao.cicloAtual % sessao.snapshotPreset.ciclosAntesPausaLonga === 0
    ? "pausaLonga"
    : "pausaCurta";
}

function iniciarFase(sessao: SessaoAtiva, fase: Fase, inicio: number): SessaoAtiva {
  const duracao = duracaoDaFase(sessao, fase);

  return {
    ...sessao,
    faseAtual: fase,
    status: "emAndamento",
    inicioFaseEm: inicio,
    fimFasePrevistoEm: inicio + duracao,
    pausadaEm: null,
    tempoRestanteAoPausarMs: null,
    atualizadaEm: inicio,
  };
}

// Transição pura para o estado concluído; a camada de persistência decide removê-la
export function encerrar(sessao: SessaoAtiva, instante: number): SessaoAtiva {
  if (sessao.status === "concluida") return sessao;

  return {
    ...sessao,
    status: "concluida",
    pausadaEm: null,
    tempoRestanteAoPausarMs: null,
    atualizadaEm: instante,
  };
}

// Avança uma fase concluída naturalmente, preservando o timestamp de término
function avancarNaturalmente(sessao: SessaoAtiva, fimDaFase: number): SessaoAtiva {
  if (sessao.faseAtual === "foco") {
    return iniciarFase(
      { ...sessao, focoConcluidoNoCiclo: true },
      proximaPausa(sessao),
      fimDaFase,
    );
  }

  if (sessao.faseAtual === "pausaLonga") return encerrar(sessao, fimDaFase);

  return iniciarFase(
    {
      ...sessao,
      cicloAtual: sessao.focoConcluidoNoCiclo ? sessao.cicloAtual + 1 : sessao.cicloAtual,
      focoConcluidoNoCiclo: false,
    },
    "foco",
    fimDaFase,
  );
}

export function iniciarSessao(
  preset: TemporizadorPersonalizado,
  agora: number,
): SessaoAtiva {
  const snapshotPreset: DadosPreset = {
    nome: preset.nome,
    tempoFocoMin: preset.tempoFocoMin,
    tempoPausaCurtaMin: preset.tempoPausaCurtaMin,
    ciclosAntesPausaLonga: preset.ciclosAntesPausaLonga,
    tempoPausaLongaMin: preset.tempoPausaLongaMin,
  };

  const sessao: SessaoAtiva = {
    id: gerarId(),
    presetId: preset.id,
    snapshotPreset,
    faseAtual: "foco",
    cicloAtual: 1,
    focoConcluidoNoCiclo: false,
    status: "emAndamento",
    inicioFaseEm: agora,
    fimFasePrevistoEm: agora + snapshotPreset.tempoFocoMin * MINUTO_EM_MS,
    pausadaEm: null,
    tempoRestanteAoPausarMs: null,
    criadaEm: agora,
    atualizadaEm: agora,
  };

  return sessao;
}

export function pausar(sessao: SessaoAtiva, agora: number): SessaoAtiva {
  const sessaoAtualizada = recalcular(sessao, agora);
  if (sessaoAtualizada.status !== "emAndamento") return sessaoAtualizada;

  const restante = Math.max(0, sessaoAtualizada.fimFasePrevistoEm - agora);

  return {
    ...sessaoAtualizada,
    status: "pausada",
    pausadaEm: agora,
    tempoRestanteAoPausarMs: restante,
    atualizadaEm: agora,
  };
}

export function retomar(sessao: SessaoAtiva, agora: number): SessaoAtiva {
  if (sessao.status !== "pausada") return sessao;

  const restante = sessao.tempoRestanteAoPausarMs ?? 0;

  return {
    ...sessao,
    status: "emAndamento",
    inicioFaseEm: agora - (duracaoDaFase(sessao, sessao.faseAtual) - restante),
    fimFasePrevistoEm: agora + restante,
    pausadaEm: null,
    tempoRestanteAoPausarMs: null,
    atualizadaEm: agora,
  };
}

// Pular não contabiliza o ciclo. Pular a pausa longa encerra a sessão
export function pularFase(sessao: SessaoAtiva, agora: number): SessaoAtiva {
  if (sessao.status === "concluida") return sessao;

  const faseSeguinte =
    sessao.faseAtual === "foco"
      ? proximaPausa(sessao)
      : sessao.faseAtual === "pausaCurta"
        ? "foco"
        : null;

  if (faseSeguinte === null) return encerrar(sessao, agora);

  const sessaoSemCicloConcluido = { ...sessao, focoConcluidoNoCiclo: false };

  if (sessao.status === "pausada") {
    const duracao = duracaoDaFase(sessaoSemCicloConcluido, faseSeguinte);
    return {
      ...sessaoSemCicloConcluido,
      faseAtual: faseSeguinte,
      inicioFaseEm: agora,
      fimFasePrevistoEm: agora + duracao,
      pausadaEm: agora,
      tempoRestanteAoPausarMs: duracao,
      atualizadaEm: agora,
    };
  }

  return iniciarFase(sessaoSemCicloConcluido, faseSeguinte, agora);
}

export function reiniciarCiclos(sessao: SessaoAtiva, agora: number): SessaoAtiva {
  if (sessao.status === "concluida") return sessao;

  const reiniciada = { ...sessao, cicloAtual: 1, focoConcluidoNoCiclo: false };
  if (sessao.status === "pausada") {
    const duracao = reiniciada.snapshotPreset.tempoFocoMin * MINUTO_EM_MS;
    return {
      ...reiniciada,
      faseAtual: "foco",
      inicioFaseEm: agora,
      fimFasePrevistoEm: agora + duracao,
      pausadaEm: agora,
      tempoRestanteAoPausarMs: duracao,
      atualizadaEm: agora,
    };
  }

  return iniciarFase(reiniciada, "foco", agora);
}

// Recalcula fases vencidas usando timestamps, até a fase vigente ou conclusão
export function recalcular(sessao: SessaoAtiva, agora: number): SessaoAtiva {
  let resultado = sessao;

  while (resultado.status === "emAndamento" && resultado.fimFasePrevistoEm <= agora) {
    resultado = avancarNaturalmente(resultado, resultado.fimFasePrevistoEm);
  }

  return resultado;
}

export function calcularTempoRestanteMs(sessao: SessaoAtiva, agora: number): number {
  if (sessao.status === "concluida") return 0;
  if (sessao.status === "pausada") {
    return Math.max(0, sessao.tempoRestanteAoPausarMs ?? 0);
  }

  const instante = Math.max(agora, sessao.atualizadaEm);
  return Math.max(0, sessao.fimFasePrevistoEm - instante);
}

export function formatarTempoRestante(tempoRestanteMs: number): string {
  const totalSegundos = Math.ceil(Math.max(0, tempoRestanteMs) / 1000);
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;

  return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
}
