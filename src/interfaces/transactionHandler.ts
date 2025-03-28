import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBTransactionRepository } from "../infrastructure/DynamoDBTransactionRepository";
import { CreateTransaction } from "../application/createTransaction";
import { GetTransactions } from "../application/getTransactions";
import { GetBalance } from "../application/getBalance";
import { ValidationError } from "../shared/ValidationError";

const repository = new DynamoDBTransactionRepository();
const createTransactionUseCase = new CreateTransaction(repository);
const getTransactionsUseCase = new GetTransactions(repository);
const getBalanceUseCase = new GetBalance(repository);

// Request Handlers
const handlePostRequest = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body || "{}");
  const transaction = await createTransactionUseCase.execute(body.userId, body.amount, body.description);
  return { statusCode: 201, body: JSON.stringify(transaction) };
};

const handleGetTransactions = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = event.queryStringParameters?.userId;
  const limit = event.queryStringParameters?.limit ? parseInt(event.queryStringParameters.limit, 10) : undefined;
  const lastEvaluatedKey = event.queryStringParameters?.lastEvaluatedKey;

  const transactions = await getTransactionsUseCase.execute(userId, limit, lastEvaluatedKey);
  return { statusCode: 200, body: JSON.stringify(transactions) };
};

const handleGetBalance = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = event.queryStringParameters?.userId;
  const month = event.queryStringParameters?.month;

  if (!userId || !month) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing userId or month (YYYY-MM)" }) };
  }

  const balanceResult = await getBalanceUseCase.execute(userId, month);
  return { statusCode: 200, body: JSON.stringify(balanceResult) };
};

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    if (event.httpMethod === "POST") {
      return await handlePostRequest(event);
    }

    if (event.httpMethod === "GET") {
      if (event.path === "/transaction") {
        return await handleGetTransactions(event);
      }
      if (event.path === "/balance") {
        return await handleGetBalance(event);
      }
    }

    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  } catch (error) {
    return error instanceof ValidationError
      ? { statusCode: 400, body: JSON.stringify({ error: error.message }) }
      : { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
  }
}
