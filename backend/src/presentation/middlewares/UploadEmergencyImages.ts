import multer from "multer";
import { ConflictError } from "../../shared/errors/ConflitError.js";

const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif"
]


export const uploadEmergencyImages = multer({
    storage:multer.memoryStorage(),
    fileFilter:(_req,file,cb)=>{
        if(allowedTypes.includes(file.mimetype)){
            cb(null, true)
        }else{
            cb(new ConflictError('Only image files are allowed','ONLY_IMAGE_FILES_ARE_ALLOWED'))
        }
    },
    limits:{
        fileSize : 5 * 1024 * 1024,
        files:5
    }
})

