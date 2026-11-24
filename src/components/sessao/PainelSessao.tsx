import { useEffect, useRef, useState } from "react";
import type React from "react";
import type { TemporizadorPersonalizado } from "../../domain/preset/tipos";
import { ROTULO_FASE, ROTULO_STATUS_SESSAO } from "../../domain/sessao/rotulos";
import {
  calcularTempoRestanteMs,
  formatarTempoRestante,
} from "../../domain/sessao/sessao";
import { useAlertaSonoro } from "../../hooks/useAlertaSonoro";
import type { UseSessao } from "../../hooks/useSessao";
import ConfirmDialog from "../ui/ConfirmDialog";

const INTERVALO_ATUALIZACAO_MS = 250;

type TipoConfirmacao = "reiniciar" | "encerrar" | "descartar" | null;

type PainelSessaoProps = {
  controleSessao: UseSessao;
  presets: TemporizadorPersonalizado[];
  audioLiberado?: boolean;
  onLiberarAudio?: () => void;
  onFimDeFase?: () => void;
};

function PainelSessao({
  controleSessao,
  presets,
  audioLiberado,
  onLiberarAudio,
  onFimDeFase,
}: PainelSessaoProps): React.JSX.Element {
  const {
    sessao,
    restauradaAutomaticamente,
    erro,
    iniciar,
    pausar,
    retomar,
    pularFase,
    reiniciarCiclos,
    recalcularAgora,
    encerrar,
    descartar,
  } = controleSessao;

  const alertaInterno = useAlertaSonoro();
  const audioAtivo = audioLiberado ?? alertaInterno.audioLiberado;
  const liberarAudio = onLiberarAudio ?? alertaInterno.liberarAudio;
  const emitirAlerta = onFimDeFase ?? alertaInterno.emitirAlerta;

  const [agora, setAgora] = useState<number>(() => Date.now());
  const [presetSelecionadoId, setPresetSelecionadoId] = useState<string>("");
  const [confirmacao, setConfirmacao] = useState<TipoConfirmacao>(null);

  const aoVencerFaseRef = useRef<() => void>(() => {});

  useEffect(() => {
    aoVencerFaseRef.current = () => {
      recalcularAgora();
      emitirAlerta();
    };
  });

  useEffect(() => {
    if (sessao === null || sessao.status !== "emAndamento") return;

    const fimFasePrevistoEm = sessao.fimFasePrevistoEm;
    const intervalId = window.setInterval(() => {
      const instante = Date.now();
      setAgora(instante);

      if (instante >= fimFasePrevistoEm) {
        aoVencerFaseRef.current();
      }
    }, INTERVALO_ATUALIZACAO_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [sessao]);

  const presetSelecionado =
    presets.find((preset) => preset.id === presetSelecionadoId) ?? presets[0] ?? null;

  const tempoRestanteMs =
    sessao !== null
      ? calcularTempoRestanteMs(sessao, agora)
      : presetSelecionado !== null
        ? presetSelecionado.tempoFocoMin * 60_000
        : 0;

  const tempoFormatado = formatarTempoRestante(tempoRestanteMs);
  const faseExibida = sessao !== null ? ROTULO_FASE[sessao.faseAtual] : "Foco";
  const cicloExibido =
    sessao !== null
      ? `${sessao.cicloAtual} de ${sessao.snapshotPreset.ciclosAntesPausaLonga}`
      : presetSelecionado !== null
        ? `1 de ${presetSelecionado.ciclosAntesPausaLonga}`
        : "—";
  const statusExibido =
    sessao !== null ? ROTULO_STATUS_SESSAO[sessao.status] : "Aguardando início";
  const faseDoPainel =
    sessao === null || sessao.status === "concluida" ? "aguardando" : sessao.faseAtual;

  const tituloDocumento =
    sessao !== null && sessao.status !== "concluida"
      ? `${tempoFormatado} — ${ROTULO_FASE[sessao.faseAtual]} | Pomodoro`
      : "Pomodoro";

  useEffect(() => {
    const tituloAnterior = document.title;
    document.title = tituloDocumento;

    return () => {
      document.title = tituloAnterior;
    };
  }, [tituloDocumento]);

  function tratarIniciar(): void {
    if (presetSelecionado === null) return;
    liberarAudio();
    setAgora(Date.now());
    iniciar(presetSelecionado);
  }

  function tratarPausar(): void {
    liberarAudio();
    setAgora(Date.now());
    pausar();
  }

  function tratarRetomar(): void {
    liberarAudio();
    setAgora(Date.now());
    retomar();
  }

  function tratarPularFase(): void {
    liberarAudio();
    setAgora(Date.now());
    pularFase();
  }

  function confirmarAcao(): void {
    if (confirmacao === "reiniciar") {
      liberarAudio();
      setAgora(Date.now());
      reiniciarCiclos();
    } else if (confirmacao === "encerrar") {
      encerrar();
    } else if (confirmacao === "descartar") {
      descartar();
    }

    setConfirmacao(null);
  }

  const podeIniciar = sessao === null || sessao.status === "concluida";
  const emAndamento = sessao?.status === "emAndamento";
  const acaoPrincipal = podeIniciar ? tratarIniciar : emAndamento ? tratarPausar : tratarRetomar;
  const rotuloAcaoPrincipal = podeIniciar ? "Iniciar" : emAndamento ? "Pausar" : "Retomar";

  return (
    <section className="painel-sessao" aria-labelledby="titulo-sessao">
      <div className="painel-sessao__cabecalho">
        <div>
          <h2 id="titulo-sessao">
            {sessao === null ? "Sessão de foco" : "Sessão ativa"}
          </h2>
          {sessao !== null && (
            <p className="painel-sessao__preset">
              Temporizador: <strong>{sessao.snapshotPreset.nome}</strong>
            </p>
          )}
        </div>
      </div>

      {erro !== null && (
        <p className="mensagem mensagem--erro" role="alert">
          <strong>Sessão:</strong> {erro}
        </p>
      )}

      {sessao !== null && restauradaAutomaticamente && (
        <div className="painel-sessao__retomada" role="status">
          <div className="painel-sessao__retomada-conteudo">
            <p className="painel-sessao__retomada-titulo">
              Sessão retomada automaticamente.
            </p>
            {!audioAtivo && sessao.status !== "concluida" && (
              <p className="painel-sessao__retomada-aviso">
                Ative o som ou interaja com os controles para liberar o alerta sonoro no
                navegador.
              </p>
            )}
          </div>
          <div className="painel-sessao__retomada-acoes">
            {!audioAtivo && sessao.status !== "concluida" && (
              <button
                className="botao botao--secundario"
                type="button"
                onClick={liberarAudio}
              >
                Ativar som
              </button>
            )}
            <button
              className="botao botao--perigo"
              type="button"
              onClick={() => setConfirmacao("descartar")}
            >
              Descartar sessão
            </button>
          </div>
        </div>
      )}

      <div className={`painel-sessao__display painel-sessao__display--${faseDoPainel}`}>
        <div className="painel-sessao__relogio" role="timer" aria-label="Tempo restante">
          <span className="painel-sessao__tempo">{tempoFormatado}</span>
        </div>

        <dl className="painel-sessao__indicadores">
          <div>
            <dt>Fase</dt>
            <dd>{faseExibida}</dd>
          </div>
          <div>
            <dt>Ciclo</dt>
            <dd>{cicloExibido}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{statusExibido}</dd>
          </div>
        </dl>
      </div>

      {sessao?.status === "concluida" && (
        <p className="painel-sessao__concluida" role="status">
          Sessão concluída! Todos os ciclos previstos foram finalizados.
        </p>
      )}

      {(sessao === null || sessao.status === "concluida") &&
        (presets.length > 0 ? (
          <div className="campo painel-sessao__seletor">
            <label htmlFor="seletor-preset-sessao">Temporizador</label>
            <select
              id="seletor-preset-sessao"
              value={presetSelecionado?.id ?? ""}
              onChange={(evento) => setPresetSelecionadoId(evento.target.value)}
            >
              {presets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.nome} ({preset.tempoFocoMin} min)
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="painel-sessao__vazio">
            Cadastre um temporizador personalizado abaixo para iniciar uma sessão de foco.
          </p>
        ))}

      <div className="painel-sessao__acoes">
        <button
          className="botao botao--primario"
          type="button"
          disabled={podeIniciar && presetSelecionado === null}
          onClick={acaoPrincipal}
        >
          {podeIniciar && (
            <svg
              className="botao__icone-play"
              viewBox="0 0 16 16"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M4.5 2.8a.8.8 0 0 1 1.2-.7l8 5.2a.8.8 0 0 1 0 1.4l-8 5.2a.8.8 0 0 1-1.2-.7V2.8Z" fill="currentColor" />
            </svg>
          )}
          {rotuloAcaoPrincipal}
        </button>

        {sessao !== null && sessao.status !== "concluida" && (
          <>
            <button
              className="botao botao--secundario"
              type="button"
              onClick={tratarPularFase}
            >
              Pular fase
            </button>
            <button
              className="botao botao--secundario"
              type="button"
              onClick={() => setConfirmacao("reiniciar")}
            >
              Reiniciar ciclos
            </button>
          </>
        )}

        {sessao !== null && (
          <button
            className="botao botao--perigo"
            type="button"
            onClick={() => setConfirmacao("encerrar")}
          >
            Encerrar sessão
          </button>
        )}
      </div>

      {confirmacao === "reiniciar" && (
        <ConfirmDialog
          aberto
          titulo="Reiniciar ciclos?"
          mensagem="A contagem de ciclos será zerada e a sessão retornará ao primeiro ciclo de foco."
          textoConfirmar="Reiniciar"
          onConfirmar={confirmarAcao}
          onCancelar={() => setConfirmacao(null)}
        />
      )}

      {confirmacao === "encerrar" && (
        <ConfirmDialog
          aberto
          titulo="Encerrar sessão?"
          mensagem="A sessão ativa será finalizada e removida."
          textoConfirmar="Encerrar"
          onConfirmar={confirmarAcao}
          onCancelar={() => setConfirmacao(null)}
        />
      )}

      {confirmacao === "descartar" && (
        <ConfirmDialog
          aberto
          titulo="Descartar sessão retomada?"
          mensagem="A sessão retomada será descartada sem contabilizar progresso."
          textoConfirmar="Descartar"
          onConfirmar={confirmarAcao}
          onCancelar={() => setConfirmacao(null)}
        />
      )}
    </section>
  );
}

export default PainelSessao;
export type { PainelSessaoProps };
