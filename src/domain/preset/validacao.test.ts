import { describe, expect, it } from "vitest";
import { LIMITES } from "../limites";
import type { EntradaPreset, TemporizadorPersonalizado } from "./tipos";
import {
  ehDadosPreset,
  ehListaPresets,
  ehTemporizadorPersonalizado,
  normalizarDadosPreset,
  validarDadosPreset,
} from "./validacao";

const DADOS_VALIDOS: EntradaPreset = {
  nome: "Estudo",
  tempoFocoMin: 25,
  tempoPausaCurtaMin: 5,
  ciclosAntesPausaLonga: 4,
  tempoPausaLongaMin: 15,
};

const PRESET_VALIDO: TemporizadorPersonalizado = {
  id: "preset-1",
  nome: "Estudo",
  tempoFocoMin: 25,
  tempoPausaCurtaMin: 5,
  ciclosAntesPausaLonga: 4,
  tempoPausaLongaMin: 15,
  criadoEm: 100,
  atualizadoEm: 200,
};

describe("normalizarDadosPreset", () => {
  it("remove espaços externos do nome sem alterar a entrada", () => {
    const entrada = { ...DADOS_VALIDOS, nome: "  Estudo  " };

    expect(normalizarDadosPreset(entrada)).toEqual({ ...DADOS_VALIDOS, nome: "Estudo" });
    expect(entrada.nome).toBe("  Estudo  ");
  });
});

describe("validarDadosPreset", () => {
  it.each(["", "   "])("rejeita nome obrigatório representado por %j", (nome) => {
    const resultado = validarDadosPreset({ ...DADOS_VALIDOS, nome });

    expect(resultado).toEqual({
      valido: false,
      erros: { nome: "Informe um nome para o temporizador." },
    });
  });

  it("rejeita nome acima de 40 caracteres", () => {
    const resultado = validarDadosPreset({
      ...DADOS_VALIDOS,
      nome: "a".repeat(LIMITES.preset.nome.max + 1),
    });

    expect(resultado).toEqual({
      valido: false,
      erros: { nome: "O nome deve ter no máximo 40 caracteres." },
    });
  });

  it.each([1, 40])("aceita nome com %i caracteres", (quantidade) => {
    const resultado = validarDadosPreset({
      ...DADOS_VALIDOS,
      nome: "a".repeat(quantidade),
    });

    expect(resultado.valido).toBe(true);
  });

  it.each([
    ["tempoFocoMin", LIMITES.preset.tempoFocoMin.min, LIMITES.preset.tempoFocoMin.max],
    [
      "tempoPausaCurtaMin",
      LIMITES.preset.tempoPausaCurtaMin.min,
      LIMITES.preset.tempoPausaCurtaMin.max,
    ],
    [
      "ciclosAntesPausaLonga",
      LIMITES.preset.ciclosAntesPausaLonga.min,
      LIMITES.preset.ciclosAntesPausaLonga.max,
    ],
    [
      "tempoPausaLongaMin",
      LIMITES.preset.tempoPausaLongaMin.min,
      LIMITES.preset.tempoPausaLongaMin.max,
    ],
  ] as const)("aceita os limites de %s", (campo, minimo, maximo) => {
    expect(validarDadosPreset({ ...DADOS_VALIDOS, [campo]: minimo }).valido).toBe(true);
    expect(validarDadosPreset({ ...DADOS_VALIDOS, [campo]: maximo }).valido).toBe(true);
  });

  it.each([
    ["tempoFocoMin", LIMITES.preset.tempoFocoMin.min, LIMITES.preset.tempoFocoMin.max],
    [
      "tempoPausaCurtaMin",
      LIMITES.preset.tempoPausaCurtaMin.min,
      LIMITES.preset.tempoPausaCurtaMin.max,
    ],
    [
      "ciclosAntesPausaLonga",
      LIMITES.preset.ciclosAntesPausaLonga.min,
      LIMITES.preset.ciclosAntesPausaLonga.max,
    ],
    [
      "tempoPausaLongaMin",
      LIMITES.preset.tempoPausaLongaMin.min,
      LIMITES.preset.tempoPausaLongaMin.max,
    ],
  ] as const)("rejeita valores inválidos de %s", (campo, minimo, maximo) => {
    const valoresInvalidos: unknown[] = [
      "",
      1.5,
      Number.NaN,
      Infinity,
      minimo - 1,
      maximo + 1,
    ];

    for (const valor of valoresInvalidos) {
      const resultado = validarDadosPreset({ ...DADOS_VALIDOS, [campo]: valor });

      expect(resultado.valido).toBe(false);
      if (!resultado.valido) expect(resultado.erros[campo]).toBeDefined();
    }
  });

  it("associa cada mensagem ao campo inválido", () => {
    const resultado = validarDadosPreset({});

    expect(resultado).toEqual({
      valido: false,
      erros: {
        nome: "Informe um nome para o temporizador.",
        tempoFocoMin: "O tempo de foco deve ser um número inteiro entre 1 e 120 minutos.",
        tempoPausaCurtaMin:
          "O tempo de pausa curta deve ser um número inteiro entre 1 e 60 minutos.",
        ciclosAntesPausaLonga:
          "A quantidade de ciclos deve ser um número inteiro entre 1 e 12.",
        tempoPausaLongaMin:
          "O tempo de pausa longa deve ser um número inteiro entre 1 e 60 minutos.",
      },
    });
  });

  it("devolve os dados válidos com o nome normalizado", () => {
    const resultado = validarDadosPreset({ ...DADOS_VALIDOS, nome: "  Estudo  " });

    expect(resultado).toEqual({ valido: true, dados: DADOS_VALIDOS });
  });
});

describe("guards de preset", () => {
  it("reconhece dados e entidades válidas", () => {
    expect(ehDadosPreset(DADOS_VALIDOS)).toBe(true);
    expect(ehTemporizadorPersonalizado(PRESET_VALIDO)).toBe(true);
    expect(ehListaPresets([PRESET_VALIDO])).toBe(true);
  });

  it("rejeita entidade com nome não normalizado ou timestamps inconsistentes", () => {
    expect(ehTemporizadorPersonalizado({ ...PRESET_VALIDO, nome: " Estudo " })).toBe(
      false,
    );
    expect(ehTemporizadorPersonalizado({ ...PRESET_VALIDO, atualizadoEm: 99 })).toBe(
      false,
    );
  });

  it("rejeita integralmente uma lista com item malformado", () => {
    const itemMalformado = { ...PRESET_VALIDO, tempoFocoMin: 0 };

    expect(ehListaPresets([PRESET_VALIDO, itemMalformado])).toBe(false);
  });

  it("rejeita lista com identificadores duplicados", () => {
    expect(ehListaPresets([PRESET_VALIDO, { ...PRESET_VALIDO }])).toBe(false);
  });
});
