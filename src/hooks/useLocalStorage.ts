export function useLocalStorage<T>(
  _chave: string,
  valorInicial: T,
): [T, (valor: T | ((anterior: T) => T)) => void] {
  // Versão provisória até a Parte 1 implementar.
  return [valorInicial, () => {}];
}