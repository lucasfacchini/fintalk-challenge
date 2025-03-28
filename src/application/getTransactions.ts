import { TransactionRepository } from "../domain/TransactionRepository";

export class GetTransactions {
  constructor(private transactionRepo: TransactionRepository) {}

  async execute(userId?: string, limit?: number, lastEvaluatedKey?: string) {
    return await this.transactionRepo.getAll(userId, limit, lastEvaluatedKey);
  }
}
