import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from '../src/server.ts'
import { config } from '../src/config.ts'
import { type LLMResponse, OpenRouterService } from '../src/openrouterService.ts'

// Testes de integração: chamam o OpenRouter de verdade.
// Rodam só com `npm run test:e2e` e uma OPENROUTER_API_KEY válida.
const skip = process.env.RUN_E2E !== '1' || !process.env.OPENROUTER_API_KEY

test('routes to cheapest model when sorting by price', { skip }, async () => {
    const customConfig ={
        ...config,
        provider: {
            ...config.provider,
            sort: {
                ...config.provider.sort,
                by: 'price'
            }
        }
    }
    const routerService = new OpenRouterService(customConfig)
    const app = createServer(routerService)

    const response = await app.inject({
        method: 'POST',
        url: '/chat',
        body:{ question:'What is rate limiting?'}
    })
    assert.equal(response.statusCode, 200)
    const body = response.json() as LLMResponse

    assert.equal(body.model, 'minimax/minimax-m3.1-flash:free')
})

test('routes to highest throughput model when sorting by throughput', { skip }, async () => {
    const customConfig ={
        ...config,
        provider: {
            ...config.provider,
            sort: {
                ...config.provider.sort,
                by: 'throughput'
            }
        }
    }
    const routerService = new OpenRouterService(customConfig)
    const app = createServer(routerService)

    const response = await app.inject({
        method: 'POST',
        url: '/chat',
        body:{ question:'What is rate limiting?'}
    })
    assert.equal(response.statusCode, 200)
    const body = response.json() as LLMResponse

    assert.equal(body.model, 'thinkingmachines/inkling-small:free')
})