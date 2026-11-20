import { criarPreset, editarPreset } from "../domain/preset/preset";
import type {
  EntradaPreset,
  ErrosPreset,
  TemporizadorPersonalizado,
} from "../domain/preset/tipos";
import { ehListaPresets, validarDadosPreset } from "../domain/preset/validacao";
import { CHAVE_PRESETS } from "../storage/chaves";
import { useLocalStorage } from "./useLocalStorage";

type FalhaOperacaoPreset =
  | { sucesso: false; motivo: "validacao"; erros: ErrosPreset }
  | {
      sucesso: false;
      motivo: "naoEncontrado" | "bloqueado" | "persistencia";
      mensagem: string;
    };

export type ResultadoOperacaoPreset = { sucesso: true } | FalhaOperacaoPreset;

export type UsePresets = {
  presets: TemporizadorPersonalizado[];
  erro: string | null;
  criar: (dados: EntradaPreset) => ResultadoOperacaoPreset;
  editar: (id: string, dados: EntradaPreset) => ResultadoOperacaoPreset;
  excluir: (id: string) => ResultadoOperacaoPreset;
};

const PRESET_NAO_ENCONTRADO = "O temporizador informado não foi encontrado.";
const PRESET_EM_USO_EDICAO =
  "Este temporizador está em uso por uma sessão ativa e não pode ser editado.";
const PRESET_EM_USO_EXCLUSAO =
  "Este temporizador está em uso por uma sessão ativa e não pode ser excluído.";

function resultadoPersistencia(erro: string | null): ResultadoOperacaoPreset {
  if (erro !== null) {
    return { sucesso: false, motivo: "persistencia", mensagem: erro };
  }

  return { sucesso: true };
}

export function usePresets(presetEmUsoId: string | null = null): UsePresets {
  const [presets, atualizarPresets, erro] = useLocalStorage<TemporizadorPersonalizado[]>(
    CHAVE_PRESETS,
    [],
    ehListaPresets,
  );

  function criar(dados: EntradaPreset): ResultadoOperacaoPreset {
    const resultado = validarDadosPreset(dados);
    if (!resultado.valido) {
      return { sucesso: false, motivo: "validacao", erros: resultado.erros };
    }

    const preset = criarPreset(resultado.dados, Date.now());
    const erroAoSalvar = atualizarPresets((anteriores) => [...anteriores, preset]);
    return resultadoPersistencia(erroAoSalvar);
  }

  function editar(id: string, dados: EntradaPreset): ResultadoOperacaoPreset {
    const presetAtual = presets.find((preset) => preset.id === id);
    if (presetAtual === undefined) {
      return { sucesso: false, motivo: "naoEncontrado", mensagem: PRESET_NAO_ENCONTRADO };
    }
    if (id === presetEmUsoId) {
      return { sucesso: false, motivo: "bloqueado", mensagem: PRESET_EM_USO_EDICAO };
    }

    const resultado = validarDadosPreset(dados);
    if (!resultado.valido) {
      return { sucesso: false, motivo: "validacao", erros: resultado.erros };
    }

    const presetEditado = editarPreset(presetAtual, resultado.dados, Date.now());
    const erroAoSalvar = atualizarPresets((anteriores) =>
      anteriores.map((preset) => (preset.id === id ? presetEditado : preset)),
    );
    return resultadoPersistencia(erroAoSalvar);
  }

  function excluir(id: string): ResultadoOperacaoPreset {
    const presetAtual = presets.find((preset) => preset.id === id);
    if (presetAtual === undefined) {
      return { sucesso: false, motivo: "naoEncontrado", mensagem: PRESET_NAO_ENCONTRADO };
    }
    if (id === presetEmUsoId) {
      return { sucesso: false, motivo: "bloqueado", mensagem: PRESET_EM_USO_EXCLUSAO };
    }

    const erroAoSalvar = atualizarPresets((anteriores) =>
      anteriores.filter((preset) => preset.id !== id),
    );
    return resultadoPersistencia(erroAoSalvar);
  }

  return { presets, erro, criar, editar, excluir };
}
