# Decisões de implementação

Este arquivo registra as escolhas necessárias para implementar os requisitos sem interpretações diferentes entre as etapas. Quando o documento de requisitos apresenta divergências, a regra de negócio mais específica é usada como referência.

## Sessões

- **Contagem de ciclos:** `cicloAtual` identifica o ciclo em andamento e começa em 1. Só avança quando foco e pausa curta terminam naturalmente. `focoConcluidoNoCiclo` registra a conclusão natural do foco para que pular foco ou pausa não conte como ciclo completo. A pausa longa encerra a sessão ao terminar naturalmente, mantendo o número do último ciclo.
- **Pular fases:** pular foco leva à pausa prevista para o ciclo atual; pular pausa curta leva ao foco do mesmo ciclo. Pular a pausa longa encerra a sessão como concluída.
- **Duração da sessão:** uma sessão termina ao concluir naturalmente a primeira pausa longa. O número de ciclos antes dessa pausa vem do snapshot do preset.
- **Sessão concluída:** fica salva com status `concluida` para que a interface possa informar o término. Iniciar outra sessão ou encerrar explicitamente remove/substitui esse registro.
- **Sessão pausada:** continua pausada ao reabrir, sem avanço temporal. Retomar recalcula o fim da fase com o tempo restante salvo.
- **Áudio restaurado:** a interface não tenta tocar áudio automaticamente ao restaurar uma sessão. A etapa da interface deve liberar o áudio após uma interação do usuário, conforme R-01.

## Tarefas

- **Ordenação:** prevalece RN-10, por ser a regra que define a ordenação fixa: prioridade alta, média e baixa; dentro de cada prioridade, a ordem é a fazer, em execução, concluída, cancelada e backlog. Essa ordem resolve a divergência com RF-19.

## Persistência

- A chave `pomodoro.sessaoAtiva` contém uma única sessão, inclusive quando concluída; encerrar ou descartar remove a chave.
- Dados inválidos ou JSON corrompido são descartados pela camada `storage`, que devolve uma mensagem de erro para a interface apresentar.
- Falhas de leitura, gravação ou remoção também são devolvidas como mensagens de erro; o domínio não acessa `localStorage`.
