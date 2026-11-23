import mongoose from "mongoose";
import { ITransactionManager } from "./interface/IMongoTransactionManger.js";
import { MongoTransactionContext } from "./MongoTransactionContext.js";

export class MongoTransactionManager implements ITransactionManager {

    async execute<T>(
        operation: (transaction: MongoTransactionContext) => Promise<T>
    ): Promise<T> {

        const session = await mongoose.startSession();

        try {
            let result!: T;

            await session.withTransaction(async () => {

                const transaction = new MongoTransactionContext(session);

                result = await operation(transaction);

            });

            return result;

        } finally {
            await session.endSession();
        }
    }
}