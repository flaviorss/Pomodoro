import type { TemporizadorPersonalizado } from "../domain/preset/tipos";
import type { SessaoAtiva } from "../domain/sessao/tipos";

export type UseSessao = {
  sessao: SessaoAtiva | null;
  // Indica restauração automática, para o aviso de UC10 e UC11.
  restauradaAutomaticamente: boolean;
  iniciar: (preset: TemporizadorPersonalizado) => void;
  pausar: () => void;
  retomar: () => void;
  pularFase: () => void;
  reiniciarCiclos: () => void;
  encerrar: () => void;
  descartar: () => void;
  trocarPreset: (preset: TemporizadorPersonalizado) => void;
};

export function useSessao(): UseSessao {
  // Versão provisória (mock) até a Parte 1 implementar.
  return {
    sessao: null,
    restauradaAutomaticamente: false,
    iniciar: () => {},
    pausar: () => {},
    retomar: () => {},
    pularFase: () => {},
    reiniciarCiclos: () => {},
    encerrar: () => {},
    descartar: () => {},
    trocarPreset: () => {},
  };
}
