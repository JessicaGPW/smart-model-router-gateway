import { assertConfig, config } from "./config.ts";
import { OpenRouterService } from "./openrouterService.ts";
import { createServer } from "./server.ts";

async function start() {
  try {
    assertConfig(config);
    const routerService = new OpenRouterService(config);
    const app = createServer(routerService);

    await app.listen({ port: config.port, host: "127.0.0.1" });
    console.log(`Servidor rodando em http://localhost:${config.port}`);
  } catch (error) {
    console.error("Falha ao iniciar o servidor:", error);
    process.exitCode = 1;
  }
}

void start();
