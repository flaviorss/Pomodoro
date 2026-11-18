import type { TemporizadorPersonalizado } from "../preset/tipos";
import type { SessaoAtiva } from "./tipos";

function naoImplementado(): never {
  throw new Error("não implementado");
}

export function iniciarSessao(
  _preset: TemporizadorPersonalizado,
  _agora: number,
): SessaoAtiva {
  return naoImplementado();
}

export function pausar(_sessao: SessaoAtiva, _agora: number): SessaoAtiva {
  return naoImplementado();
}

export function retomar(_sessao: SessaoAtiva, _agora: number): SessaoAtiva {
  return naoImplementado();
}

export function pularFase(_sessao: SessaoAtiva, _agora: number): SessaoAtiva {
  return naoImplementado();
}

export function reiniciarCiclos(
  _sessao: SessaoAtiva,
  _agora: number,
): SessaoAtiva {
  return naoImplementado();
}

export function recalcular(_sessao: SessaoAtiva, _agora: number): SessaoAtiva {
  return naoImplementado();
}