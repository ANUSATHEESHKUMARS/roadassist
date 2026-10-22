import { MechanicApplicationMapper } from "../../application/mappers/MechanicApplicationMapper.js";
import { IMechanicApplicationRepository } from "../../domain/repositories/mechanic/IMechanicApplicationRepository.js";
import { MechanicApplication, MechanicApplicationStatus } from "../../domain/User/entities/MechanicApplication.js";
import { IMechanicApplicationDocument, MechanicApplicationModel } from "../databases/models/MechanicApplicationModel.js";
import { MongoBasRepository } from "./MongoBaseRepostory.js";
import { Types } from "mongoose";


export class MongoMechanicApplicaitonRepository
    extends MongoBasRepository<IMechanicApplicationDocument> implements IMechanicApplicationRepository {
    constructor() {
        super(MechanicApplicationModel);
    }
    async create(application: MechanicApplication): Promise<MechanicApplication> {
        const data = MechanicApplicationMapper.toPersistence(application)
        const document = await this.createDocument(data)
        return MechanicApplicationMapper.toDomain(document)
    }

    async findById(applicationId: string): Promise<MechanicApplication | null> {
        const document = await this.findByIdDocument(applicationId)
        if (!document) {
            return null
        }
        return MechanicApplicationMapper.toDomain(document)
    }
    async findByUserId(userId: string): Promise<MechanicApplication | null> {
        if (!Types.ObjectId.isValid(userId)) {
            return null
        }
        const document = await MechanicApplicationModel.findOne({
            userId: new Types.ObjectId(userId)
        });
        if (!document) {
            return null
        }
        return MechanicApplicationMapper.toDomain(document)
    }

    async update(applicationId: string, application: MechanicApplication): Promise<MechanicApplication | null> {
        if (!Types.ObjectId.isValid(applicationId)) {
            return null
        }
        const data = MechanicApplicationMapper.toPersistence(application)
        const document = await this.updateDocument(applicationId, data)
        if (!document) {
            return null
        }
        return MechanicApplicationMapper.toDomain(document)
    }

    async findByStatus(status: MechanicApplicationStatus): Promise<MechanicApplication[]> {
        const document = await MechanicApplicationModel.find({ status }).exec()

        return document.map((document) => MechanicApplicationMapper.toDomain(document))
    }
}



