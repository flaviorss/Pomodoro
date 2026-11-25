<div align="center"  >
  <h1 align="center" >
    Pomodoro
    <br />
  </h1>
 <img src="https://skillicons.dev/icons?i=react" alt=""> &nbsp;
 <img src="https://skillicons.dev/icons?i=ts" alt=""> &nbsp;
 <img src="https://skillicons.dev/icons?i=vite" alt=""> &nbsp;
</div>

## Sobre o Projeto

Aplicação web para organizar sessões de foco no estilo Pomodoro e gerenciar tarefas de estudo. O projeto foi desenvolvido em equipe como parte da disciplina de Desenvolvimento Web.

## Funcionalidades

- Criar, editar, listar e excluir temporizadores personalizados, com validação dos campos.
- Iniciar sessões com foco, pausas curtas e pausas longas, usando uma cópia das configurações do temporizador no início da sessão.
- Acompanhar o tempo restante, a fase, o ciclo e o estado da sessão.
- Pausar, retomar, pular fases, reiniciar ciclos e encerrar sessões.
- Persistir temporizadores, tarefas e sessão no `localStorage`, com restauração da sessão ao reabrir a aplicação.
- Emitir alerta sonoro ao fim das fases, após o áudio ser liberado por uma interação do usuário.
- Criar, editar, concluir e excluir tarefas, com prioridades e estados organizados no painel lateral.
- Usar a interface em telas menores, com o painel de tarefas reorganizado abaixo do temporizador.

## Tecnologias

- React
- TypeScript
- Vite
- Vitest e React Testing Library
- ESLint e Prettier

## Pré-requisitos

- Node.js compatível com a versão atual do Vite.
- npm.

## Instalação e execução

```bash
npm install
npm run dev
```

Abra no navegador o endereço informado pelo Vite (normalmente `http://localhost:5173`). Para encerrar o servidor, pressione `Ctrl+C` no terminal.

## Comandos disponíveis

```bash
npm run dev       # inicia o servidor de desenvolvimento
npm run build     # verifica os tipos e gera a versão de produção em dist/
npm run preview   # serve localmente a versão de produção
npm run lint      # verifica o código com ESLint
npm run format    # formata os arquivos de src/ com Prettier
npm run test      # executa os testes uma vez
npm run typecheck # verifica os tipos TypeScript
```

Antes de entregar alterações, execute:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

## Organização do código

- `src/domain/`: tipos e regras de negócio de sessões, temporizadores e tarefas.
- `src/storage/`: chaves de persistência.
- `src/hooks/`: estado da aplicação, persistência e operações usadas pela interface.
- `src/components/`: componentes da interface, separados por funcionalidade.
- `src/styles.css`: estilos globais e responsivos.
- `docs/`: documentação de requisitos

## Desenvolvedores
| Foto | Nome | Github |
| --- | --- | --- |
| <img src="https://github.com/flaviorss.png" width="60px;"/><br /> | Flávio Santos | https://github.com/flaviorss |
| <img src="https://github.com/natansantoz.png" width="60px;"/><br /> | Natã Teixeira | https://github.com/natansantoz |
| <img src="https://github.com/MarcosMMarques.png" width="60px;"/><br /> | Marcos Marques | https://github.com/MarcosMMarques |
| <img src="https://github.com/pedro-diaspgd.png" width="60px;"/><br /> | Pedro Gabriel | https://github.com/pedro-diaspgd |
