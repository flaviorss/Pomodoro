export type ResultadoLeitura<T> = {
  valor: T;
  erro: string | null;
};

export type Validador<T> = (valor: unknown) => valor is T;

const ERRO_LEITURA = "Não foi possível ler os dados salvos neste navegador.";
const ERRO_ESCRITA = "Não foi possível salvar os dados neste navegador.";
const ERRO_REMOCAO = "Não foi possível remover os dados salvos neste navegador.";

// Lê e valida um valor persistido. Dados inválidos são descartados
export function ler<T>(
  chave: string,
  valorInicial: T,
  validar: Validador<T>,
): ResultadoLeitura<T> {
  let serializado: string | null;

  try {
    serializado = window.localStorage.getItem(chave);
  } catch {
    return { valor: valorInicial, erro: ERRO_LEITURA };
  }

  if (serializado === null) return { valor: valorInicial, erro: null };

  let valor: unknown;
  try {
    valor = JSON.parse(serializado);
  } catch {
    return descartarInconsistencia(chave, valorInicial);
  }

  if (validar(valor)) return { valor, erro: null };
  return descartarInconsistencia(chave, valorInicial);
}

function descartarInconsistencia<T>(chave: string, valorInicial: T): ResultadoLeitura<T> {
  const erroAoRemover = remover(chave);

  return {
    valor: valorInicial,
    erro: erroAoRemover ?? "Os dados salvos estavam inconsistentes e foram descartados.",
  };
}

// Persiste um valor serializável e devolve uma mensagem se a operação falhar
export function gravar<T>(chave: string, valor: T): string | null {
  try {
    const serializado = JSON.stringify(valor);
    if (serializado === undefined) return ERRO_ESCRITA;

    window.localStorage.setItem(chave, serializado);
    return null;
  } catch {
    return ERRO_ESCRITA;
  }
}

// Remove uma chave persistida e devolve uma mensagem se a operação falhar
export function remover(chave: string): string | null {
  try {
    window.localStorage.removeItem(chave);
    return null;
  } catch {
    return ERRO_REMOCAO;
  }
}
