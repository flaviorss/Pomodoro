<div align="center"  >
    <h1 align="center" >
        Pomodoro
        <br />
    </h1>
    <img src="https://skillicons.dev/icons?i=react" alt="">&nbsp;
    <img src="https://skillicons.dev/icons?i=ts" alt="">&nbsp;
    <img src="https://skillicons.dev/icons?i=vite" alt="">
</div>

## Definição do Projeto

Aplicação web de gestão de foco baseada na técnica Pomodoro. O projeto está sendo desenvolvido em equipe como parte da disciplina de Desenvolvimento Web. A proposta é permitir configurar temporizadores, acompanhar sessões de foco e pausas e organizar tarefas de estudo.

## Tecnologias

- React
- TypeScript
- Vite
- ESLint e Prettier

## Funcionalidades disponíveis

- Criação, edição e exclusão de temporizadores personalizados.
- Validação dos campos de duração, quantidade de ciclos e nome.
- Persistência dos temporizadores e da sessão no `localStorage`.
- Confirmação antes de excluir um temporizador.
- Início de uma sessão e troca direta para outro temporizador.
- Bloqueio de edição e exclusão do temporizador usado pela sessão ativa.
- Snapshot da configuração no início da sessão, preservando seus valores originais.

A contagem regressiva e os controles completos para pausar, retomar ou encerrar uma
sessão ainda não fazem parte da interface atual.

## Como executar

### Pré-requisitos

- Node.js e npm instalados.

### Instalação e execução local

1. Clone este repositório e abra a pasta do projeto no terminal.
2. Instale as dependências:

   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Abra no navegador o endereço exibido pelo Vite no terminal (normalmente `http://localhost:5173`).

O servidor atualiza a aplicação automaticamente quando os arquivos são alterados. Para encerrar, pressione `Ctrl+C` no terminal.

## Comandos disponíveis

```bash
npm run dev       # inicia o servidor de desenvolvimento
npm run build     # verifica os tipos e gera a versão de produção em dist/
npm run preview   # serve localmente a versão gerada
npm run lint      # verifica o código com ESLint
npm run format    # formata os arquivos de src/ com Prettier
npm run test      # executa todos os testes uma vez e encerra
npm run typecheck # verifica os tipos TypeScript
```

## Verificação do projeto

Execute a sequência abaixo antes de enviar alterações:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

Os testes usam Vitest e React Testing Library e não permanecem em modo interativo.

## Organização do código

- `src/domain/`: tipos e regras de negócio, separados por presets, sessões e tarefas.
- `src/storage/`: chaves de persistência do navegador.
- `src/hooks/`: hooks que conectam os dados e as operações à interface.
- `src/components/`: componentes da interface.
- `docs/`: documentos do projeto
