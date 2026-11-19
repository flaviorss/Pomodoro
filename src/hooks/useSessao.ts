import { useEffect, useRef, useState } from "react";
import type { TemporizadorPersonalizado } from "../domain/preset/tipos";
import {
  iniciarSessao,
  pausar as pausarSessao,
  pularFase as pularFaseSessao,
  recalcular as recalcularSessao,
  reiniciarCiclos as reiniciarCiclosSessao,
  retomar as retomarSessao,
} from "../domain/sessao/sessao";
import type { SessaoAtiva } from "../domain/sessao/tipos";
import { ehSessaoAtiva } from "../domain/sessao/validacao";
import { useLocalStorage } from "./useLocalStorage";
import { CHAVE_SESSAO_ATIVA } from "../storage/chaves";

export type UseSessao = {
  sessao: SessaoAtiva | null;
  restauradaAutomaticamente: boolean;
  erro: string | null;
  iniciar: (preset: TemporizadorPersonalizado) => void;
  pausar: () => void;
  retomar: () => void;
  pularFase: () => void;
  reiniciarCiclos: () => void;
  recalcularAgora: () => void;
  encerrar: () => void;
  descartar: () => void;
  trocarPreset: (preset: TemporizadorPersonalizado) => void;
};

export function useSessao(): UseSessao {
  const [sessao, setSessao, erro, removerSessao] = useLocalStorage<SessaoAtiva | null>(
    CHAVE_SESSAO_ATIVA,
    null,
    (valor): valor is SessaoAtiva | null => valor === null || ehSessaoAtiva(valor),
  );
  const [restauradaAutomaticamente, setRestauradaAutomaticamente] = useState(
    () => sessao !== null,
  );
  const sessaoInicialId = useRef(sessao?.id ?? null);
  const restauracaoPendente = useRef(sessao !== null);

  useEffect(() => {
    if (!restauracaoPendente.current || sessao === null) return;

    const timeoutId = window.setTimeout(() => {
      restauracaoPendente.current = false;
      setSessao((sessaoAtual) => {
        if (sessaoAtual === null || sessaoAtual.id !== sessaoInicialId.current) {
          return sessaoAtual;
        }

        return recalcularSessao(sessaoAtual, Date.now());
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [sessao, setSessao]);

  const sessaoAtual = sessao;

  function atualizar(transformar: (atual: SessaoAtiva) => SessaoAtiva): void {
    if (sessaoAtual === null) return;
    setSessao(transformar(sessaoAtual));
  }

  function iniciar(preset: TemporizadorPersonalizado): void {
    if (sessaoAtual !== null && sessaoAtual.status !== "concluida") return;

    setRestauradaAutomaticamente(false);
    setSessao(iniciarSessao(preset, Date.now()));
  }

  function pausar(): void {
    atualizar((atual) => pausarSessao(atual, Date.now()));
  }

  function retomar(): void {
    atualizar((atual) => retomarSessao(atual, Date.now()));
  }

  function pularFase(): void {
    const agora = Date.now();
    atualizar((atual) => pularFaseSessao(recalcularSessao(atual, agora), agora));
  }

  function reiniciarCiclos(): void {
    const agora = Date.now();
    atualizar((atual) => reiniciarCiclosSessao(recalcularSessao(atual, agora), agora));
  }

  function recalcularAgora(): void {
    atualizar((atual) => recalcularSessao(atual, Date.now()));
  }

  function encerrar(): void {
    setRestauradaAutomaticamente(false);
    removerSessao();
  }

  function trocarPreset(preset: TemporizadorPersonalizado): void {
    setRestauradaAutomaticamente(false);
    setSessao(iniciarSessao(preset, Date.now()));
  }

  return {
    sessao: sessaoAtual,
    restauradaAutomaticamente,
    erro,
    iniciar,
    pausar,
    retomar,
    pularFase,
    reiniciarCiclos,
    recalcularAgora,
    encerrar,
    descartar: encerrar,
    trocarPreset,
  };
}
