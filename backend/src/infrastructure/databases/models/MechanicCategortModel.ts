
import mongoose, {
    Schema,
    Types,
    Document,
    Model
} from "mongoose";

// Subcategory document interface
interface MechanicSubCategoryDocument {
    _id: Types.ObjectId;
    name: string;
    slug: string;
    description?: string;
    isActive: boolean;
}

// Category document interface
export interface MechanicCategoryDocument {
    _id: Types.ObjectId;
    name: string;
    slug: string;
    description?: string;
    subcategories: MechanicSubCategoryDocument[];
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Subcategory schema
const MechanicSubCategorySchema =
    new Schema<MechanicSubCategoryDocument>({
        name: {
            type: String,
            required: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    });

// Category schema
const MechanicCategorySchema =
    new Schema<MechanicCategoryDocument>(
        {
            name: {
                type: String,
                required: true,
                trim: true
            },
            slug: {
                type: String,
                required: true,
                unique: true,
                trim: true
            },
            description: {
                type: String,
                trim: true
            },
            subcategories: {
                type: [MechanicSubCategorySchema],
                default: []
            },
            isActive: {
                type: Boolean,
                default: true
            }
        },
        {
            timestamps: true
        }
    );

// Export model
export const MechanicCategoryModel: Model<MechanicCategoryDocument> =
    (mongoose.models.MechanicCategory as Model<MechanicCategoryDocument>) ||
    mongoose.model<MechanicCategoryDocument>(
        "MechanicCategory",
        MechanicCategorySchema
    );
