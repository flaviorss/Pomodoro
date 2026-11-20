import { gerarId } from "../id";
import type { DadosPreset, TemporizadorPersonalizado } from "./tipos";

type GeradorId = () => string;

export function criarPreset(
  dados: DadosPreset,
  agora: number,
  gerarIdentificador: GeradorId = gerarId,
): TemporizadorPersonalizado {
  return {
    id: gerarIdentificador(),
    ...dados,
    criadoEm: agora,
    atualizadoEm: agora,
  };
}

export function editarPreset(
  preset: TemporizadorPersonalizado,
  dados: DadosPreset,
  agora: number,
): TemporizadorPersonalizado {
  return {
    ...preset,
    ...dados,
    id: preset.id,
    criadoEm: preset.criadoEm,
    atualizadoEm: agora,
  };
}
