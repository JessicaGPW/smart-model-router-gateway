import { config } from "./config.ts";
import { OpenRouterService } from "./openrouterService.ts";
import { createServer } from "./server.ts";

async function start() {
  try {
    const routerService = new OpenRouterService(config);
    const app = createServer(routerService);

    const address = await app.listen({ port: 3000, host: "127.0.0.1" });
    console.log("Servidor rodando em http://localhost:3000");

    app.inject({
    method: 'POST',
     url: '/chat',
     body:{ question:'What is rate limiting?'}
 }).then((response) => {
     console.log('Response status', response.statusCode)
     console.log('Response body', response.body)
 })
  } catch (error) {
    console.error("Falha ao iniciar o servidor:", error);
    process.exitCode = 1;
  }
}

void start();

// app.inject({
//     method: 'POST',
//     url: '/chat',
//     body:{ question:'What is rate limiting?'}
// }).then((response) => {
//     console.log('Response status', response.statusCode)
//     console.log('Response body', response.body)
// })