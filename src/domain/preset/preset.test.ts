import { describe, expect, it, vi } from "vitest";
import type { DadosPreset, TemporizadorPersonalizado } from "./tipos";
import { criarPreset, editarPreset } from "./preset";

const DADOS: DadosPreset = {
  nome: "Estudo",
  tempoFocoMin: 25,
  tempoPausaCurtaMin: 5,
  ciclosAntesPausaLonga: 4,
  tempoPausaLongaMin: 15,
};

const PRESET: TemporizadorPersonalizado = {
  id: "preset-1",
  ...DADOS,
  criadoEm: 100,
  atualizadoEm: 100,
};

describe("criarPreset", () => {
  it("cria a entidade com identificador e timestamps", () => {
    const gerarIdentificador = vi.fn(() => "preset-2");

    expect(criarPreset(DADOS, 200, gerarIdentificador)).toEqual({
      id: "preset-2",
      ...DADOS,
      criadoEm: 200,
      atualizadoEm: 200,
    });
    expect(gerarIdentificador).toHaveBeenCalledOnce();
  });
});

describe("editarPreset", () => {
  it("preserva id e criação e atualiza os dados e o timestamp", () => {
    const novosDados: DadosPreset = {
      ...DADOS,
      nome: "Leitura",
      tempoFocoMin: 50,
    };

    expect(editarPreset(PRESET, novosDados, 300)).toEqual({
      id: "preset-1",
      ...novosDados,
      criadoEm: 100,
      atualizadoEm: 300,
    });
  });

  it("não altera a entidade original", () => {
    editarPreset(PRESET, { ...DADOS, nome: "Leitura" }, 300);

    expect(PRESET).toEqual({
      id: "preset-1",
      ...DADOS,
      criadoEm: 100,
      atualizadoEm: 100,
    });
  });
});
