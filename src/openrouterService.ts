import { OpenRouter } from '@openrouter/sdk'
import { config, type ModelConfig } from './config.ts'
import { type ChatGenerationParams } from '@openrouter/sdk/models'

export type LLMResponse = {
    model: string;
    content: string;
}

type ChatClient = Pick<OpenRouter, 'chat'>

export class OpenRouterService {
    private client: ChatClient
    private config: ModelConfig

    constructor(configOverride?: ModelConfig, client?: ChatClient) {
        this.config = configOverride ?? config

        this.client = client ?? new OpenRouter({
            apiKey: this.config.apiKey,
            httpReferer: this.config.httpReferer,
            xTitle: this.config.xTitle
        })
    }

    async generate(prompt: string): Promise<LLMResponse> {
        const response = await this.client.chat.send({
            models: this.config.models,
            messages: [
                { role: 'system', content: this.config.systemPrompt },
                { role: 'user', content: prompt }
            ],
            stream: false,
            temperature: this.config.temperature,
            maxTokens: this.config.maxTokens,
            provider: this.config.provider as ChatGenerationParams['provider']
        })

        const raw = response.choices.at(0)?.message.content
        const content = typeof raw === 'string'
            ? raw
            : Array.isArray(raw)
                ? raw.map((part) => ('text' in part ? part.text : '')).join('')
                : ''

        return {
            model: response.model,
            content,
        }
    }
}
