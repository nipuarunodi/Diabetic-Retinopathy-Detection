export class FileUpload {
    key: string;
    name: string;
    url: string;
    file: File;
    processedImageUrl: string;
    prediction: any;
    timestamp: any;
    constructor(file: File) {
      this.file = file;
    }
  }