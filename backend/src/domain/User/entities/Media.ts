export type MediaType = "image" | "video";

export interface MediaProps {
    id?: string;

    originalName: string;
    fileKey: string;
    mimeType: string;
    mediaType: MediaType;
    size: number;
    section: string;

    createdAt?: Date;
    updatedAt?: Date;
}

export class Media {

    private readonly _id : string | undefined;

    private readonly _originalName: string;
    private readonly _fileKey: string;
    private readonly _mimeType: string;
    private readonly _mediaType: MediaType;
    private readonly _size: number;
    private readonly _section: string;

    private readonly _createdAt: Date;
    private _updatedAt: Date;

    constructor(props: MediaProps) {

        this._id = props.id;

        this._originalName = props.originalName;
        this._fileKey = props.fileKey;
        this._mimeType = props.mimeType;
        this._mediaType = props.mediaType;
        this._size = props.size;
        this._section = props.section;

        this._createdAt = props.createdAt ?? new Date();
        this._updatedAt = props.updatedAt ?? new Date();
    }



    get id(): string | undefined {
        return this._id;
    }

    get originalName(): string {
        return this._originalName;
    }

    get fileKey(): string {
        return this._fileKey;
    }

    get mimeType(): string {
        return this._mimeType;
    }

    get mediaType(): MediaType {
        return this._mediaType;
    }

    get size(): number {
        return this._size;
    }

    get section(): string {
        return this._section;
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    get updatedAt(): Date {
        return this._updatedAt;
    }



    public touch(): void {
        this._updatedAt = new Date();
    }
}