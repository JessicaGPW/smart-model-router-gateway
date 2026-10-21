export type ModelConfig = {
    apiKey: string;
    httpReferer: string;
    xTitle: string;
    port: number;
    models: string[];
    temperature: number;
    maxTokens: number;
    systemPrompt: string;

    provider: {
        sort: {
            by: string,
            partition: string,
        }
    }
}

export const config: ModelConfig = {
    apiKey: process.env.OPENROUTER_API_KEY ?? '',
    httpReferer: 'https://github.com/JessicaGPW/smart-model-router-gateway',
    xTitle: 'SmartModelRouterGateway',
    port: Number(process.env.PORT ?? 3000),
    models: [
        // primeiro da listagem ordenada por preço
        'minimax/minimax-m3.1-flash:free',
        // primeiro da listagem ordenada por throughput
        'thinkingmachines/inkling-small:free',
    ],
    temperature: 0.2,
    maxTokens: 100,
    systemPrompt:
        'You are a concise technical assistant. Answer the user question clearly and accurately in the same language it was asked. If you do not know, say so.',
    provider: {
        sort: {
            by: 'throughput', // 'latency' | 'price' | 'throughput'
            partition: 'none'
        }
    }
}

export function assertConfig(cfg: ModelConfig): void {
    if (!cfg.apiKey) {
        throw new Error('OPENROUTER_API_KEY is not set. Copy .env.example to .env and add your key.')
    }
}
