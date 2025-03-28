import { TransactionRepository } from "../domain/TransactionRepository";

export class GetBalance {
  constructor(private transactionRepo: TransactionRepository) {}

  async execute(userId: string, month: string): Promise<{ balance: number }> {
    const transactions = await this.transactionRepo.getByUserAndMonth(userId, month);

    const balance = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    return { balance };
  }
}
