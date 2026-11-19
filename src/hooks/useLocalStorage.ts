import { useRef, useState } from "react";
import { gravar, ler, remover, type Validador } from "../storage/localStorage";

export type Atualizador<T> = (valor: T | ((anterior: T) => T)) => void;
export type EstadoLocalStorage<T> = [
  valor: T,
  atualizar: Atualizador<T>,
  erro: string | null,
  descartar: () => void,
];

// Mantém estado React sincronizado com uma chave validada do localStorage.
export function useLocalStorage<T>(
  chave: string,
  valorInicial: T,
  validar: Validador<T>,
): EstadoLocalStorage<T> {
  const [estado, setEstado] = useState(() => ler(chave, valorInicial, validar));
  const valorAtual = useRef(estado.valor);

  function atualizar(valorOuFuncao: T | ((anterior: T) => T)): void {
    const valor =
      typeof valorOuFuncao === "function"
        ? (valorOuFuncao as (anterior: T) => T)(valorAtual.current)
        : valorOuFuncao;

    valorAtual.current = valor;
    setEstado({ valor, erro: gravar(chave, valor) });
  }

  function descartar(): void {
    valorAtual.current = valorInicial;
    setEstado({ valor: valorInicial, erro: remover(chave) });
  }

  return [estado.valor, atualizar, estado.erro, descartar];
}
