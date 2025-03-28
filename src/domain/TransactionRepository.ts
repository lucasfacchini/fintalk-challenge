import { Transaction } from "./Transaction";

export interface TransactionRepository {
  save(transaction: Transaction): Promise<void>;
  getAll(userId?: string, limit?: number, lastEvaluatedKey?: string): Promise<{ transactions: Transaction[], lastEvaluatedKey?: string }>;
  getByUserAndMonth(userId: string, month: string): Promise<Transaction[]>
}
