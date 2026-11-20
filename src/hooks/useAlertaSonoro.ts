import { useCallback, useEffect, useRef, useState } from "react";

export type UseAlertaSonoro = {
  audioLiberado: boolean;
  liberarAudio: () => void;
  emitirAlerta: () => void;
};

type JanelaComAudio = Window & {
  webkitAudioContext?: typeof AudioContext;
};

function criarContextoAudio(): AudioContext | null {
  if (typeof window === "undefined") return null;

  const Construtor =
    window.AudioContext ?? (window as JanelaComAudio).webkitAudioContext;
  if (Construtor === undefined) return null;

  try {
    return new Construtor();
  } catch {
    return null;
  }
}

export function useAlertaSonoro(): UseAlertaSonoro {
  const [audioLiberado, setAudioLiberado] = useState<boolean>(false);
  const contextoRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      const contexto = contextoRef.current;
      if (contexto !== null && typeof contexto.close === "function") {
        void contexto.close().catch(() => {});
        contextoRef.current = null;
      }
    };
  }, []);

  const liberarAudio = useCallback((): void => {
    setAudioLiberado(true);

    try {
      if (contextoRef.current === null) {
        contextoRef.current = criarContextoAudio();
      }

      const contexto = contextoRef.current;
      if (contexto === null) return;

      if (contexto.state === "suspended") {
        void contexto.resume();
      }

      const oscilador = contexto.createOscillator();
      const ganho = contexto.createGain();
      ganho.gain.setValueAtTime(0.0001, contexto.currentTime);
      oscilador.connect(ganho);
      ganho.connect(contexto.destination);
      oscilador.start(contexto.currentTime);
      oscilador.stop(contexto.currentTime + 0.01);
    } catch {
      // Ignora bloqueios de autoplay ou falta de suporte no navegador
    }
  }, []);

  const emitirAlerta = useCallback((): void => {
    try {
      if (contextoRef.current === null) {
        contextoRef.current = criarContextoAudio();
      }

      const contexto = contextoRef.current;
      if (contexto === null) return;

      if (contexto.state === "suspended") {
        void contexto.resume();
      }

      const agora = contexto.currentTime;
      const oscilador = contexto.createOscillator();
      const ganho = contexto.createGain();

      oscilador.type = "sine";
      oscilador.frequency.setValueAtTime(880, agora);
      oscilador.frequency.setValueAtTime(660, agora + 0.18);

      ganho.gain.setValueAtTime(0.0001, agora);
      ganho.gain.exponentialRampToValueAtTime(0.25, agora + 0.02);
      ganho.gain.exponentialRampToValueAtTime(0.0001, agora + 0.45);

      oscilador.connect(ganho);
      ganho.connect(contexto.destination);

      oscilador.start(agora);
      oscilador.stop(agora + 0.45);
    } catch {
      // Ignora bloqueios de autoplay ou falta de suporte no navegador
    }
  }, []);

  return {
    audioLiberado,
    liberarAudio,
    emitirAlerta,
  };
}
