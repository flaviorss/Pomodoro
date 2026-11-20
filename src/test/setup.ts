import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";

function criarStorage(): Storage {
  const dados = new Map<string, string>();

  return {
    get length() {
      return dados.size;
    },
    clear() {
      dados.clear();
    },
    getItem(chave) {
      return dados.get(chave) ?? null;
    },
    key(indice) {
      return [...dados.keys()][indice] ?? null;
    },
    removeItem(chave) {
      dados.delete(chave);
    },
    setItem(chave, valor) {
      dados.set(chave, valor);
    },
  };
}

beforeEach(() => {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: criarStorage(),
  });
});

afterEach(cleanup);
