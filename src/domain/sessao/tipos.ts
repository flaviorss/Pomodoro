import type { DadosPreset } from "../preset/tipos";

// Fases possíveis de uma sessão.
export type Fase = "foco" | "pausaCurta" | "pausaLonga";

// Status possíveis de uma sessão.
export type StatusSessao = "emAndamento" | "pausada" | "concluida";

// Sessão ativa persistida no localStorage.
export type SessaoAtiva = {
  id: string;
  // Referência ao preset de origem.
  presetId: string;
  // Cópia dos parâmetros do preset no início da sessão (RN-05).
  snapshotPreset: DadosPreset;
  faseAtual: Fase;
  // Ciclo corrente, a partir de 1.
  cicloAtual: number;
  // Permite contar o ciclo só quando foco e pausa terminam naturalmente.
  focoConcluidoNoCiclo: boolean;
  status: StatusSessao;
  // Timestamps em milissegundos.
  inicioFaseEm: number;
  fimFasePrevistoEm: number;
  pausadaEm: number | null;
  tempoRestanteAoPausarMs: number | null;
  criadaEm: number;
  atualizadaEm: number;
};
