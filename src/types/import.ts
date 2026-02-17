export type ImportStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | string;

export interface ImportOperationDTO {
    id: number;
    username: string;
    objectType: string;
    status: ImportStatus;
    importedCount?: number | null;
    errorMessage?: string | null;
    startedAt?: string | null;
    finishedAt?: string | null;
}
