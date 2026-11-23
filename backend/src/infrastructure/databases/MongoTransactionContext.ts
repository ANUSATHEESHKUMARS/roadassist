import { ClientSession } from "mongoose";

import { ITransactionContext } from "./interface/ITransactionContext.js";

export class MongoTransactionContext implements ITransactionContext {
    constructor(public readonly session: ClientSession) {}
}