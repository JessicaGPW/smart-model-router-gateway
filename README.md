# Smart Model Router Gateway

API em TypeScript e Node.js que recebe uma pergunta em uma rota HTTP e a encaminha ao OpenRouter usando uma lista de modelos e uma política de seleção configurável. Este repositório demonstra uma camada de gateway entre aplicações internas e provedores de modelos de linguagem.

> Projeto requer uma chave válida do OpenRouter para executar chamadas reais.

## Problema que o projeto aborda

Aplicações que chamam modelos de linguagem diretamente podem acabar com a escolha do modelo, os parâmetros e a integração com o provedor espalhados pelo código. Um gateway centraliza esse ponto de integração e oferece uma rota interna estável para os sistemas consumidores.

Uma empresa poderia usar uma camada assim para:

- concentrar a configuração de modelos e parâmetros;
- trocar ou ordenar modelos sem alterar cada aplicação cliente;
- escolher uma política de seleção alinhada a latência, throughput ou preço;
- padronizar a validação da entrada e o formato da resposta;
- criar um ponto único para adicionar autenticação, limites de uso, métricas e auditoria.

Este protótipo encaminha solicitações ao OpenRouter. A política ativa está configurada para throughput e a lista de candidatos fica em src/config.ts. O projeto não mede economia ou desempenho por conta própria; esses resultados precisam ser avaliados com dados e testes representativos.

## Funcionalidades atuais

- API HTTP com Fastify.
- Rota POST /chat que exige uma pergunta com pelo menos cinco caracteres.
- Serviço separado para criar chamadas ao SDK do OpenRouter.
- Lista configurável de modelos candidatos e ordenação do provedor.
- Resposta com o identificador do modelo usado e o conteúdo gerado.
- Configuração local por variável de ambiente OPENROUTER_API_KEY.
- Testes unitários com cliente simulado (sem rede) e testes de integração opcionais.

## Tecnologias

- **TypeScript** para a aplicação e os tipos.
- **Node.js** para execução do serviço.
- **Fastify** para a API HTTP e a validação do corpo da requisição.
- **OpenRouter SDK** para encaminhar solicitações aos modelos.
- **Node.js Test Runner** e **node:assert** para testes.
- **npm** para instalar dependências e executar scripts.

## Arquitetura

A aplicação separa configuração, transporte HTTP e integração com o provedor:

1. src/index.ts carrega as configurações, cria o serviço e inicia o servidor.
2. src/server.ts define a rota e valida o corpo da requisição.
3. src/openrouterService.ts monta a solicitação do modelo e transforma a resposta em model e content.
4. src/config.ts reúne chave, modelos candidatos, parâmetros e política do provedor.
5. tests/router.test.ts cobre a rota com cliente simulado; tests/router.e2e.test.ts verifica a integração real.

O diagrama e as observações de implementação estão em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Requisitos e configuração local

É necessário ter Node.js 22.18 ou superior (executa TypeScript direto), npm e uma chave de API do OpenRouter.

No PowerShell, a partir da pasta do repositório:

    npm install
    Copy-Item .env.example .env
    notepad .env

No arquivo .env local, substitua o valor de exemplo por sua chave:

    OPENROUTER_API_KEY=sua-chave-real

Não publique o arquivo .env nem cole a chave em mensagens, commits ou comandos salvos no histórico do terminal. O arquivo .env.example é o modelo seguro para compartilhar.

## Executar a API

    npm run dev

O servidor local inicia na porta 3000 (ou na definida em PORT) e encerra com mensagem clara se a chave não estiver configurada. O modo de desenvolvimento observa mudanças e reinicia o processo.

Exemplo de chamada pelo PowerShell:

    Invoke-RestMethod -Method Post -Uri 'http://127.0.0.1:3000/chat' -ContentType 'application/json' -Body '{"question":"Explique rate limiting em uma frase."}'

Formato esperado da resposta:

    {
      "model": "identificador-do-modelo",
      "content": "resposta gerada"
    }

## Testes

    npm test            # unitários, cliente simulado: sem chave, sem rede, sem custo
    npm run typecheck   # checagem de tipos com tsc

Integração com o OpenRouter real (usa a chave do .env e pode consumir créditos):

    $env:RUN_E2E='1'; npm run test:e2e

O resultado da integração depende da disponibilidade dos modelos no provedor.

## Estrutura do projeto

    smart-model-router-gateway/
    ├── src/
    │   ├── config.ts
    │   ├── index.ts
    │   ├── openrouterService.ts
    │   └── server.ts
    ├── tests/
    │   ├── router.test.ts
    │   └── router.e2e.test.ts
    ├── .env.example
    ├── .gitignore
    ├── package.json
    ├── package-lock.json
    ├── tsconfig.json
    ├── LICENSE
    ├── README.md
    └── docs/
        └── ARCHITECTURE.md

## Limites e próximos passos

Antes de tratar o protótipo como serviço de produção, recomenda-se:

- adicionar autenticação, limites de requisição e controles de custo;
- registrar latência, modelo selecionado, erros e uso sem armazenar prompts sensíveis;
- definir timeouts, política de repetição e comportamento para indisponibilidade;
- documentar retenção e tratamento de dados enviados ao provedor.

## Licença

MIT. Veja [LICENSE](LICENSE).
