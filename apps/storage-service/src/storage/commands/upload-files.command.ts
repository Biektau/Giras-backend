type FilePayload = {
    buffer: Buffer | { data: number[] };
    originalname: string;
    mimetype: string;
    size: number;
};

export class UploadFilesCommand {
    constructor(public readonly files: FilePayload[]) {}
}
