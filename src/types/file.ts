export interface FileUploadResult {
  fileId: string;
  url: string;
  originalName: string;
  size: number;
  format: string;
}

export interface FileUploadResponse {
  message: string;
  data: FileUploadResult;
}

export interface FileDownloadResponse {
  message: string;
  data: {
    downloadUrl: string;
    expiresIn: number;
    expiresAt: string;
  };
}

export interface FileInfoResponse {
  message: string;
  data: {
    publicId: string;
    url: string;
    size: number;
    format: string;
    createdAt: string;
    resourceType: string;
  };
}

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileUploadError {
  error: string;
  message: string;
}