import { ITransactionContext } from "./ITransactionContext.js";

export interface ITransactionManager {
    execute<T>(operation: (transaction : ITransactionContext)=>Promise<T>):Promise<T>
}