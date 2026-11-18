export type TemporizadorPersonalizado = {
  
  id: string; // Identificador único. 
  nome: string; // Nome do preset, de 1 a 40 caracteres.
  tempoFocoMin: number; // Tempo de foco em minutos, de 1 a 120.
  tempoPausaCurtaMin: number; // Tempo de pausa curta em minutos, de 1 a 60.
  ciclosAntesPausaLonga: number; // Ciclos de foco antes da pausa longa, de 1 a 12.
  tempoPausaLongaMin: number; // Tempo de pausa longa em minutos, de 1 a 60.
  criadoEm: number; // Timestamp de criação, em milissegundos.
  atualizadoEm: number; // Timestamp da última atualização, em milissegundos.
};

export type DadosPreset = Omit<
  TemporizadorPersonalizado,
  "id" | "criadoEm" | "atualizadoEm"
>;