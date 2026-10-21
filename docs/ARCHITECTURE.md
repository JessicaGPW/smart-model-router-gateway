# Arquitetura — Smart Model Router Gateway

## Visão geral

O serviço é um backend HTTP pequeno, escrito em TypeScript e executado com Node.js. Ele recebe uma pergunta, valida o corpo da requisição com Fastify e delega a geração ao SDK do OpenRouter.

O gateway atual centraliza a integração e os parâmetros de seleção. Ele não mantém dados de negócio, não possui banco de dados e não tem interface web.

## Diagrama do fluxo

    Aplicação cliente
          │
          │ POST /chat
          ▼
    Fastify — validação do corpo
          │
          ▼
    OpenRouterService — monta a solicitação
          │
          ▼
    OpenRouter SDK — chamada externa
          │
          ▼
    Modelo/provedor selecionado
          │
          ▼
    { model, content } → aplicação cliente

## Módulos atuais

| Módulo | Responsabilidade |
|---|---|
| src/index.ts | Cria os objetos de serviço e servidor e valida a chave e inicia a escuta na porta de config.port (padrão 3000, ou PORT) |
| src/server.ts | Define POST /chat, exige question e aplica tamanho mínimo de cinco caracteres |
| src/openrouterService.ts | Cria o cliente OpenRouter, envia system/user messages e converte a resposta |
| src/config.ts | Mantém API key, modelos, prompt, temperatura, limite de tokens e ordenação |
| tests/router.test.ts | Testes unitários com cliente simulado: política, prompt, validação, erro 500, conteúdo vazio |
| tests/router.e2e.test.ts | Integração opcional com o OpenRouter real (RUN_E2E=1) |
| .env | Configuração local e segredo; não deve entrar no Git |
| .env.example | Modelo sem segredo para documentar a variável necessária |

## Caminho de uma solicitação

1. O cliente envia JSON para POST /chat com a propriedade question.
2. Fastify rejeita corpos sem question ou com menos de cinco caracteres.
3. A rota chama OpenRouterService.generate.
4. O serviço envia mensagens system e user, a lista de modelos e as opções configuradas.
5. O OpenRouter retorna uma resposta; o serviço devolve o modelo e o conteúdo.
6. A rota responde ao cliente com esses dois campos.

## Política de seleção

A lista de modelos e a ordenação do provedor são definidas em src/config.ts. A política ativa está configurada para throughput. Outras ordenações aceitas: price e latency.

A seleção final depende do comportamento do OpenRouter e da disponibilidade dos modelos. O gateway não calcula métricas próprias nem garante uma economia ou latência específica.

## Configuração e segredo

OPENROUTER_API_KEY é carregada pelo Node por meio do argumento --env-file .env nos scripts do package.json. .env.example documenta a variável esperada sem conter o segredo real. O arquivo .env deve ser ignorado pelo Git e conferido antes de qualquer commit.

## Rota HTTP

### POST /chat

Corpo:

    {
      "question": "What is rate limiting?"
    }

Resposta de sucesso:

    {
      "model": "provider/model",
      "content": "..."
    }

A validação atual exige que question tenha no mínimo cinco caracteres. Não há limite máximo configurado no schema.

## Testes e dependências externas

Os testes usam app.inject para chamar a rota sem abrir uma porta HTTP. O OpenRouterService aceita um cliente injetado, então `npm test` roda com um cliente simulado: sem rede, sem chave e sem custo. Os testes de integração em tests/router.e2e.test.ts chamam o OpenRouter real e só rodam com `RUN_E2E=1` e uma chave válida.

## Decisões de implementação

- A porta vem de config.port (variável PORT, padrão 3000).
- O cliente do OpenRouter é criado a partir de this.config, então a configuração injetada vale também para chave, referer e título.
- index.ts valida a chave com assertConfig e falha com mensagem clara antes de abrir a porta.
- Erros do provedor viram 500 com corpo JSON padronizado, sem expor detalhes internos.
- Conteúdo ausente vira string vazia; conteúdo em partes é concatenado.

## Evolução proposta para uso empresarial

    Cliente interno
        ↓
    Gateway Fastify
        ├── autenticação e autorização
        ├── validação e limites de entrada
        ├── política de seleção de modelos
        ├── timeouts e tratamento de falhas
        ├── logs e métricas sem prompts sensíveis
        └── serviço de integração OpenRouter
                ↓
            Provedores de modelos

Próximos controles recomendados: autenticação de clientes, rate limiting, limites de custo, timeouts, métricas de latência e erros, logs redigidos, testes simulados, e políticas de privacidade para prompts encaminhados a terceiros.


