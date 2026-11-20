import type { JSX } from "react";
import type { TemporizadorPersonalizado } from "../../domain/preset/tipos";

type ListaPresetsProps = {
  presets: TemporizadorPersonalizado[];
  presetEmUsoId: string | null;
  onSelecionar: (preset: TemporizadorPersonalizado) => void;
  onEditar: (preset: TemporizadorPersonalizado) => void;
  onExcluir: (preset: TemporizadorPersonalizado) => void;
};

function ListaPresets({
  presets,
  presetEmUsoId,
  onSelecionar,
  onEditar,
  onExcluir,
}: ListaPresetsProps): JSX.Element {
  if (presets.length === 0) {
    return (
      <div className="estado-vazio" role="status">
        <p className="estado-vazio__titulo">Nenhum temporizador cadastrado</p>
      </div>
    );
  }

  return (
    <>
      <p className="lista-presets__resumo" aria-live="polite">
        {presets.length}{" "}
        {presets.length === 1 ? "temporizador cadastrado" : "temporizadores cadastrados"}
      </p>
      <ul
        className="lista-presets lista-presets--carregada"
        aria-label="Temporizadores cadastrados"
      >
        {presets.map((preset) => {
          const emUso = preset.id === presetEmUsoId;
          const explicacaoId = `preset-${preset.id}-em-uso`;

          return (
            <li
              key={preset.id}
              className={`preset-card${emUso ? " preset-card--bloqueado" : ""}`}
            >
              <article aria-labelledby={`preset-${preset.id}-nome`}>
                <div className="preset-card__cabecalho">
                  <h3 id={`preset-${preset.id}-nome`}>{preset.nome}</h3>
                </div>

                <dl className="preset-card__parametros">
                  <div>
                    <dt>Foco</dt>
                    <dd>{preset.tempoFocoMin} min</dd>
                  </div>
                  <div>
                    <dt>Pausa curta</dt>
                    <dd>{preset.tempoPausaCurtaMin} min</dd>
                  </div>
                  <div>
                    <dt>Ciclos</dt>
                    <dd>{preset.ciclosAntesPausaLonga}</dd>
                  </div>
                  <div>
                    <dt>Pausa longa</dt>
                    <dd>{preset.tempoPausaLongaMin} min</dd>
                  </div>
                </dl>

                {emUso && (
                  <p id={explicacaoId} className="preset-card__aviso">
                    Encerre a sessão ativa para editar ou excluir este temporizador.
                  </p>
                )}

                <div className="preset-card__acoes">
                  {emUso ? (
                    <span className="preset-card__em-uso">Em uso</span>
                  ) : (
                    <button
                      className="botao botao--primario"
                      type="button"
                      onClick={() => onSelecionar(preset)}
                    >
                      {presetEmUsoId === null ? "Iniciar" : "Trocar Para Este Preset"}
                    </button>
                  )}
                  <button
                    className="botao botao--secundario"
                    type="button"
                    disabled={emUso}
                    aria-describedby={emUso ? explicacaoId : undefined}
                    onClick={() => onEditar(preset)}
                  >
                    Editar
                  </button>
                  <button
                    className="botao botao--secundario"
                    type="button"
                    disabled={emUso}
                    aria-describedby={emUso ? explicacaoId : undefined}
                    onClick={() => onExcluir(preset)}
                  >
                    Excluir
                  </button>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default ListaPresets;
export type { ListaPresetsProps };
