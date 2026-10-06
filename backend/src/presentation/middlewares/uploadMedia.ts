import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (
    _req,
    file,
    cb
) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/avif",
        "video/mp4",
        "video/webm",
        "video/quicktime",
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Unsupported file type"));
    }
};

export const uploadMedia = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024,
    },
});