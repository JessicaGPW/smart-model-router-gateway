console.assert(
    process.env.OPENROUTER_API_KEY,
    'OPENROUTER_API_KEY is not set in env variables'
)

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
    apiKey: process.env.OPENROUTER_API_KEY!,
    httpReferer: 'https://openrouter.ai/.com',
    xTitle: 'SmartModelRouterGateway',
    port: 3000,
    models: [
        // top 4 para a listagem ordenada por preço
        'minimax/minimax-m3.1-flash:free',
        

        // top 3 para listagem de throughput
        'thinkingmachines/inkling-small:free',
        
    ],
    temperature: 0.2,
    maxTokens: 100,
    systemPrompt: 'What is rate limiting?',
    provider: {
        sort: {
            by:'throughput',
            // by: 'latency',
            // by: 'price',
            partition: 'none'
        }
    }
}