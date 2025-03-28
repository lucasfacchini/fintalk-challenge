import { randomUUID } from 'crypto'
import { ValidationError } from '../shared/ValidationError'

export class Transaction {
    constructor(
      public readonly id: string,
      public readonly userId: string,
      public readonly amount: number,
      public readonly createdAt: string,
      public readonly description: string
    ) {}

    static create(userId: string, amount: number, description: string): Transaction {
      if (!userId) {
        throw new ValidationError("User ID is required");
      }

      if (amount == 0) {
        throw new ValidationError("Amount can't be zero");
      }

      if (!description || description.trim().length === 0) {
        throw new ValidationError("Description cannot be empty");
      }

      return new Transaction(
        randomUUID(),
        userId,
        amount,
        new Date().toISOString(),
        description
      );
    }
  }
