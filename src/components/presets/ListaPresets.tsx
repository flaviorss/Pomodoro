import type { JSX } from "react";
import type { TemporizadorPersonalizado } from "../../domain/preset/tipos";

type ListaPresetsProps = {
  presets: TemporizadorPersonalizado[];
  presetEmUsoId: string | null;
  onEditar: (preset: TemporizadorPersonalizado) => void;
  onExcluir: (preset: TemporizadorPersonalizado) => void;
};

function ListaPresets({
  presets,
  presetEmUsoId,
  onEditar,
  onExcluir,
}: ListaPresetsProps): JSX.Element {
  if (presets.length === 0) {
    return (
      <div className="estado-vazio">
        <p className="estado-vazio__titulo">Nenhum temporizador cadastrado</p>
      </div>
    );
  }

  return (
    <ul className="lista-presets" aria-label="Temporizadores cadastrados">
      {presets.map((preset) => {
        const emUso = preset.id === presetEmUsoId;
        const explicacaoId = `preset-${preset.id}-em-uso`;

        return (
          <li key={preset.id} className="preset-card">
            <article aria-labelledby={`preset-${preset.id}-nome`}>
              <div className="preset-card__cabecalho">
                <h3 id={`preset-${preset.id}-nome`}>{preset.nome}</h3>
                {emUso && <span className="selo-em-uso">Em uso</span>}
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
  );
}

export default ListaPresets;
export type { ListaPresetsProps };
