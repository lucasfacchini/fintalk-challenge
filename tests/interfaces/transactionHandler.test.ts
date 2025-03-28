import { handler } from "../../src/interfaces/transactionHandler";
import { APIGatewayProxyEvent, APIGatewayProxyEventQueryStringParameters } from "aws-lambda";
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, ScanCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

const ddbMock = mockClient(DynamoDBDocumentClient);

describe("Transaction Lambda Handler", () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it("should return 201 when creating a transaction", async () => {
    const transaction = { userId: "user123", amount: 100, description: "Groceries" }

    const event = {
      httpMethod: "POST",
      body: JSON.stringify(transaction),
    } as APIGatewayProxyEvent;

    const response = await handler(event);
    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body)).toEqual({
      ...transaction,
      ...{
        id: expect.any(String),
        createdAt: expect.any(String)
      }
    });
  });

  it("should return 400 for empty description", async () => {
    const event = {
      httpMethod: "POST",
      body: JSON.stringify({ userId: "user123", amount: 100, description: "" }),
    } as APIGatewayProxyEvent;

    const response = await handler(event);
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ error: "Description cannot be empty" });
  });

  it("should return 400 for amount zero", async () => {
    const event = {
      httpMethod: "POST",
      body: JSON.stringify({ userId: "user123", amount: 0, description: "Invalid" }),
    } as APIGatewayProxyEvent;

    const response = await handler(event);
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ error: "Amount can't be zero" });
  });

  it("should return 200 when retrieving transactions", async () => {
    const transaction = { userId: "user123", amount: 100, description: "Groceries" }

    ddbMock.on(ScanCommand).resolves({
      Items: [transaction],
    });

    const event = {
      httpMethod: "GET",
      path: '/transaction'
    } as APIGatewayProxyEvent;

    const response = await handler(event);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({"transactions": [transaction]});
  });

  it("should return 200 when retrieving transactions with userId filter", async () => {
    const transaction = { userId: "user123", amount: 100, description: "Groceries" }

    ddbMock.on(QueryCommand).resolves({
      Items: [transaction],
    });

    const event = {
      httpMethod: "GET",
      path: '/transaction',
      queryStringParameters: {
        userId: "1234"
      } as APIGatewayProxyEventQueryStringParameters
    } as APIGatewayProxyEvent;

    const response = await handler(event);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({"transactions": [transaction]});
  })

  it("should return 405 for unsupported methods", async () => {
    const event = {
      httpMethod: "PUT",
    } as APIGatewayProxyEvent;

    const response = await handler(event);
    expect(response.statusCode).toBe(405);
  });

  it("should return 200 when retrieving balance", async () => {
    const transactions = [
      { userId: "user123", amount: 99.99, description: "Groceries" },
      { userId: "user123", amount: 11.11, description: "Groceries" }
    ]

    ddbMock.on(QueryCommand).resolves({
      Items: transactions,
    });

    const event = {
      httpMethod: "GET",
      path: '/balance',
      queryStringParameters: {
        userId: "1234",
        month: `1990-01`
      } as APIGatewayProxyEventQueryStringParameters
    } as APIGatewayProxyEvent;

    const response = await handler(event);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({"balance": 111.1});
  })

  it("should return 200 when retrieving balance zero", async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [],
    });

    const event = {
      httpMethod: "GET",
      path: '/balance',
      queryStringParameters: {
        userId: "1234",
        month: `1990-01`
      } as APIGatewayProxyEventQueryStringParameters
    } as APIGatewayProxyEvent;

    const response = await handler(event);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({"balance": 0});
  })
});
