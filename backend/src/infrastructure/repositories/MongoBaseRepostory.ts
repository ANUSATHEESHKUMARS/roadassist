import { Model } from "mongoose"


export class MongoBasRepository<T>{
  constructor(protected readonly model:Model<T>){}
        protected async createDocument(data: Partial<T>): Promise<T> {
             return await this.model.create(data)
         }
       protected  async findByIdDocument(id: string): Promise<T | null> {
             return await this.model.findById(id)
         }
      protected   async findAllDocuments(): Promise<T[]> {
             return await this.model.find()
         }
      protected   async updateDocument(id: string, data: Partial<T>): Promise<T | null> {
             return await this.model.findByIdAndUpdate(id, data,{returnDocument : 'after' , runValidators:true})
         }
        protected async deleteDocument(id: string): Promise<void> {
             await this.model.findByIdAndDelete(id)
         }
}