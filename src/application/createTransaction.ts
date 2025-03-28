import { Transaction } from "../domain/Transaction";
import { TransactionRepository } from "../domain/TransactionRepository";

export class CreateTransaction {
  constructor(private transactionRepo: TransactionRepository) {}

  async execute(userId: string, amount: number, description: string): Promise<Transaction> {
    const transaction = Transaction.create(userId, amount, description);
    await this.transactionRepo.save(transaction);
    return transaction;
  }
}
