import type {
  DadosPreset,
  TemporizadorPersonalizado,
} from "../domain/preset/tipos";

export type UsePresets = {
  presets: TemporizadorPersonalizado[];
  criar: (dados: DadosPreset) => void;
  editar: (id: string, dados: DadosPreset) => void;
  excluir: (id: string) => void;
};

export function usePresets(): UsePresets {
  return { presets: [], criar: () => {}, editar: () => {}, excluir: () => {} };
}