import { Command } from "commander";
import { handler } from "./interfaces/transactionHandler"
import { APIGatewayProxyEvent, APIGatewayProxyEventQueryStringParameters } from "aws-lambda";

const program = new Command();

program.version("1.0.0").description("CLI para testes locais");


async function invokeHandler(httpMethod: string, path: string, queryParams: any = {}, body: any = null) {
  const event = {
      httpMethod,
      path: `/${path}`,
      queryStringParameters: queryParams,
      body: body ? JSON.stringify(body) : null
  };

  try {
      const result = await handler(event as any);
      console.log(JSON.stringify(JSON.parse(result.body), null, 2));
  } catch (error) {
      console.error("Error:", error);
  }
}


// Handle GET requests
program
  .command("get <endpoint>")
  .description("Requisição GET")
  .option("-q, --query <query>", "Parâmetros (key=value,key=value)")
  .action(async (endpoint, options) => {
    const queryParams = options.query
      ? Object.fromEntries(options.query.split(",").map((q: string) => q.split("=")))
      : {};

    await invokeHandler("GET", endpoint, queryParams);
  });

// Handle POST requests
program
  .command("post <endpoint>")
  .description("Requisição POST")
  .option("-d, --data <data>", "Dados em JSON")
  .action(async (endpoint, options) => {
    const data = options.data ? JSON.parse(options.data) : {};
    await invokeHandler("POST", endpoint, {}, data);
  });

program.parse(process.argv);

// const event = {
//     httpMethod: "GET",
//     path: '/balance',
//     queryStringParameters: {
//         userId: "1234",
//         month: `1990-01`
//     } as APIGatewayProxyEventQueryStringParameters
// } as APIGatewayProxyEvent;

// const response = handler(event).then((a) => console.log(a))
