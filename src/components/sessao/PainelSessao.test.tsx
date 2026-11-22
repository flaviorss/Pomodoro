import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DadosPreset, TemporizadorPersonalizado } from "../../domain/preset/tipos";
import { iniciarSessao, pausar } from "../../domain/sessao/sessao";
import { useSessao } from "../../hooks/useSessao";
import { CHAVE_SESSAO_ATIVA } from "../../storage/chaves";
import PainelSessao from "./PainelSessao";

const DADOS_PRESET: DadosPreset = {
  nome: "Estudo",
  tempoFocoMin: 25,
  tempoPausaCurtaMin: 5,
  ciclosAntesPausaLonga: 2,
  tempoPausaLongaMin: 15,
};

const PRESET_ESTUDO: TemporizadorPersonalizado = {
  id: "preset-1",
  ...DADOS_PRESET,
  criadoEm: 100,
  atualizadoEm: 100,
};

function PainelTeste({
  presets = [PRESET_ESTUDO],
  onLiberarAudio,
  onFimDeFase,
}: {
  presets?: TemporizadorPersonalizado[];
  onLiberarAudio?: () => void;
  onFimDeFase?: () => void;
}): React.JSX.Element {
  const controleSessao = useSessao();

  return (
    <PainelSessao
      controleSessao={controleSessao}
      presets={presets}
      onLiberarAudio={onLiberarAudio}
      onFimDeFase={onFimDeFase}
    />
  );
}

beforeEach(() => {
  window.localStorage.clear();
  document.title = "Pomodoro";
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("PainelSessao", () => {
  it("inicia sessão pelo painel, libera o áudio e exibe fase, ciclo e status", async () => {
    const usuario = userEvent.setup();
    const liberarAudio = vi.fn();
    render(<PainelTeste onLiberarAudio={liberarAudio} />);

    expect(screen.getByRole("heading", { name: "Sessão de foco" })).toBeInTheDocument();
    expect(screen.getByRole("timer", { name: "Tempo restante" })).toHaveTextContent(
      "25:00",
    );

    await usuario.click(screen.getByRole("button", { name: "Iniciar" }));

    expect(liberarAudio).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { name: "Sessão ativa" })).toBeInTheDocument();
    expect(screen.getByText("Foco")).toBeInTheDocument();
    expect(screen.getByText("1 de 2")).toBeInTheDocument();
    expect(screen.getByText("Em andamento")).toBeInTheDocument();
    expect(document.title).toBe("25:00 — Foco | Pomodoro");
  });

  it("atualiza contagem regressiva por timestamps e emite alerta ao fim da fase", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(1_000));
    const fimDeFase = vi.fn();

    render(<PainelTeste onFimDeFase={fimDeFase} />);
    fireEvent.click(screen.getByRole("button", { name: "Iniciar" }));

    expect(screen.getByRole("timer", { name: "Tempo restante" })).toHaveTextContent(
      "25:00",
    );

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(screen.getByRole("timer", { name: "Tempo restante" })).toHaveTextContent(
      "24:50",
    );

    act(() => {
      vi.advanceTimersByTime(25 * 60_000 - 10_000);
    });

    expect(fimDeFase).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Pausa curta")).toBeInTheDocument();
    expect(screen.getByRole("timer", { name: "Tempo restante" })).toHaveTextContent(
      "05:00",
    );
  });

  it("pausa, retoma e pula fases da sessão ativa", async () => {
    const usuario = userEvent.setup();
    render(<PainelTeste />);

    await usuario.tab();
    await usuario.tab();
    expect(screen.getByRole("button", { name: "Iniciar" })).toHaveFocus();
    await usuario.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Pausar" })).toHaveFocus();
    await usuario.keyboard("{Enter}");
    expect(screen.getByText("Pausada")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Retomar" })).toHaveFocus();
    await usuario.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Pausar" })).toHaveFocus();
    expect(screen.getByText("Em andamento")).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Pular fase" }));
    expect(screen.getByText("Pausa curta")).toBeInTheDocument();
    expect(screen.getByText("1 de 2")).toBeInTheDocument();
  });

  it("solicita confirmação para reiniciar ciclos e encerrar sessão", async () => {
    const usuario = userEvent.setup();
    render(<PainelTeste />);

    await usuario.click(screen.getByRole("button", { name: "Iniciar" }));
    await usuario.click(screen.getByRole("button", { name: "Pular fase" }));
    expect(screen.getByText("Pausa curta")).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Reiniciar ciclos" }));
    const dialogoReiniciar = screen.getByRole("alertdialog", {
      name: "Reiniciar ciclos?",
    });
    await usuario.click(
      within(dialogoReiniciar).getByRole("button", { name: "Reiniciar" }),
    );

    expect(screen.getByText("Foco")).toBeInTheDocument();
    expect(screen.getByText("1 de 2")).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Encerrar sessão" }));
    const dialogoEncerrar = screen.getByRole("alertdialog", {
      name: "Encerrar sessão?",
    });
    await usuario.click(
      within(dialogoEncerrar).getByRole("button", { name: "Encerrar" }),
    );

    expect(screen.getByRole("heading", { name: "Sessão de foco" })).toBeInTheDocument();
    expect(window.localStorage.getItem(CHAVE_SESSAO_ATIVA)).toBeNull();
  });

  it("exibe aviso de sessão retomada automaticamente e permite descartá-la com confirmação", async () => {
    const sessaoSalva = pausar(iniciarSessao(PRESET_ESTUDO, 1_000), 61_000);
    window.localStorage.setItem(CHAVE_SESSAO_ATIVA, JSON.stringify(sessaoSalva));
    const usuario = userEvent.setup();

    render(<PainelTeste />);

    expect(screen.getByText("Sessão retomada automaticamente.")).toBeInTheDocument();
    expect(screen.getByRole("timer", { name: "Tempo restante" })).toHaveTextContent(
      "24:00",
    );

    await usuario.click(screen.getByRole("button", { name: "Descartar sessão" }));
    const dialogoDescartar = screen.getByRole("alertdialog", {
      name: "Descartar sessão retomada?",
    });
    await usuario.click(
      within(dialogoDescartar).getByRole("button", { name: "Descartar" }),
    );

    expect(screen.queryByText("Sessão retomada automaticamente.")).toBeNull();
    expect(window.localStorage.getItem(CHAVE_SESSAO_ATIVA)).toBeNull();
  });
});
