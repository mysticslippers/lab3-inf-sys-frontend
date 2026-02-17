import React, { useEffect, useState } from 'react';
import Spinner from '../common/Spinner';
import { importsApi } from '../../api/importsApi';
import type { ImportOperationDTO } from '../../types/import';
import { getApiErrorMessage } from '../../utils/errorUtils';

interface Props {
    open: boolean;
    onClose: () => void;
    onUploaded?: (operation: ImportOperationDTO) => void;
}

const ImportUploadModal: React.FC<Props> = ({ open, onClose, onUploaded }) => {
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setFile(null);
            setError(null);
            setSubmitting(false);
        }
    }, [open]);

    if (!open) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!file) {
            setError('Выберите JSON-файл для импорта');
            return;
        }

        setSubmitting(true);
        try {
            const op = await importsApi.importRoutesFile(file);
            onUploaded?.(op);
            onClose();
        } catch (err: any) {
            const msg = getApiErrorMessage(err, 'Не удалось запустить импорт');
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (submitting) return;
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
                <button
                    type="button"
                    onClick={handleClose}
                    className="absolute right-4 top-4 text-slate-500 hover:text-slate-300"
                >
                    ✕
                </button>

                <h3 className="mb-4 text-lg font-semibold">
                    Импорт маршрутов из JSON-файла
                </h3>

                {error && (
                    <div className="mb-3 rounded-lg border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                    <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                            JSON-файл импорта *
                        </label>
                        <input
                            type="file"
                            className="w-full text-sm text-slate-200 file:mr-3 file:rounded-xl file:border-0 file:bg-emerald-600 file:px-3 file:py-2 file:text-xs file:font-medium file:text-white hover:file:bg-emerald-500"
                            accept=".json,application/json"
                            onChange={(e) =>
                                setFile(e.target.files?.[0] ?? null)
                            }
                        />
                        <p className="mt-1 text-xs text-slate-400">
                            Ожидается JSON-массив маршрутов в формате RouteDTO с
                            вложенными объектами coordinates/from/to.
                        </p>
                    </div>

                    <div className="mt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={submitting}
                            className="rounded-xl border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
                        >
                            {submitting && <Spinner size="sm" />}
                            <span>Запустить импорт</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ImportUploadModal;
