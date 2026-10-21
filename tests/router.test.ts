import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from '../src/server.ts'
import { config } from '../src/config.ts'
import { type LLMResponse, OpenRouterService } from '../src/openrouterService.ts'

// Testes unitários: cliente simulado, sem rede e sem custo.
function fakeClient(reply: (params: any) => any) {
    const calls: any[] = []
    const client = {
        chat: {
            send: async (params: any) => {
                calls.push(params)
                return reply(params)
            }
        }
    }
    return { client: client as any, calls }
}

const withSort = (by: string) => ({
    ...config,
    provider: { ...config.provider, sort: { ...config.provider.sort, by } }
})

test('forwards the configured policy, models and system prompt', async () => {
    const { client, calls } = fakeClient(() => ({
        model: 'minimax/minimax-m3.1-flash:free',
        choices: [{ message: { content: 'ok' } }]
    }))
    const app = createServer(new OpenRouterService(withSort('price'), client))

    const response = await app.inject({ method: 'POST', url: '/chat', body: { question: 'What is rate limiting?' } })

    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json<LLMResponse>(), { model: 'minimax/minimax-m3.1-flash:free', content: 'ok' })
    assert.equal(calls[0].provider.sort.by, 'price')
    assert.deepEqual(calls[0].models, config.models)
    assert.equal(calls[0].messages[0].content, config.systemPrompt)
    assert.equal(calls[0].messages[1].content, 'What is rate limiting?')
})

test('returns empty content instead of "undefined" when the model sends nothing', async () => {
    const { client } = fakeClient(() => ({ model: 'm', choices: [{ message: { content: null } }] }))
    const app = createServer(new OpenRouterService(config, client))

    const response = await app.inject({ method: 'POST', url: '/chat', body: { question: 'hello world' } })

    assert.equal(response.json<LLMResponse>().content, '')
})

test('joins text parts when content is an array', async () => {
    const { client } = fakeClient(() => ({
        model: 'm',
        choices: [{ message: { content: [{ type: 'text', text: 'a' }, { type: 'text', text: 'b' }] } }]
    }))
    const app = createServer(new OpenRouterService(config, client))

    const response = await app.inject({ method: 'POST', url: '/chat', body: { question: 'hello world' } })

    assert.equal(response.json<LLMResponse>().content, 'ab')
})

test('rejects questions shorter than 5 characters', async () => {
    const { client, calls } = fakeClient(() => ({}))
    const app = createServer(new OpenRouterService(config, client))

    const response = await app.inject({ method: 'POST', url: '/chat', body: { question: 'hi' } })

    assert.equal(response.statusCode, 400)
    assert.equal(calls.length, 0)
})

test('returns a JSON 500 when the provider fails', async (t) => {
    t.mock.method(console, 'error', () => {})
    const { client } = fakeClient(() => { throw new Error('provider down') })
    const app = createServer(new OpenRouterService(config, client))

    const response = await app.inject({ method: 'POST', url: '/chat', body: { question: 'hello world' } })

    assert.equal(response.statusCode, 500)
    assert.deepEqual(response.json(), { error: 'Failed to generate a response' })
})
