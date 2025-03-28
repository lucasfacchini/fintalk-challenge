import { TransactionRepository } from "../domain/TransactionRepository";
import { Transaction } from "../domain/Transaction";
import { DynamoDBDocument, ScanCommand, QueryCommand, ScanCommandInput, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";

const dynamoDb = DynamoDBDocument.from(new DynamoDB({endpoint: process.env['DYNAMODB_ENDPOINT']}));
const TABLE_NAME = "Transactions";

export class DynamoDBTransactionRepository implements TransactionRepository {
  async save(transaction: Transaction): Promise<void> {
    await dynamoDb.put({ TableName: TABLE_NAME, Item: transaction });
  }

  async getAll(userId?: string, limit?: number, lastEvaluatedKey?: string): Promise<{ transactions: Transaction[], lastEvaluatedKey?: string }> {
    let params: ScanCommandInput | QueryCommandInput = {
      TableName: TABLE_NAME,
      Limit: limit
    };

    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = { id: lastEvaluatedKey };
    }

    if (userId) {
      params = {
        ...params,
        IndexName: "UserIdIndex",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId
        }
      };

      const result = await dynamoDb.send(new QueryCommand(params));

      return {
        transactions: result.Items as Transaction[],
        lastEvaluatedKey: result.LastEvaluatedKey?.id
      };
    }

    const result = await dynamoDb.send(new ScanCommand(params));
    return {
      transactions: result.Items as Transaction[],
      lastEvaluatedKey: result.LastEvaluatedKey?.id
    };
  }

  async getByUserAndMonth(userId: string, month: string): Promise<Transaction[]> {
    const startOfMonth = `${month}-01T00:00:00.000Z`;
    const endOfMonth = `${month}-31T23:59:59.999Z`;

    const params: QueryCommandInput = {
      TableName: TABLE_NAME,
      IndexName: "UserIdIndex",
      KeyConditionExpression: "userId = :userId AND createdAt BETWEEN :start AND :end",
      ExpressionAttributeValues: {
        ":userId": userId,
        ":start": startOfMonth,
        ":end": endOfMonth
      }
    };

    const result = await dynamoDb.send(new QueryCommand(params));
    return result.Items as Transaction[];
  }
}
