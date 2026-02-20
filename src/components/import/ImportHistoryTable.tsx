import React from 'react';
import type { ImportOperationDTO } from '../../types/import';
import { importsApi } from '../../api/importsApi';
import { toast } from 'react-toastify';

interface Props {
    items: ImportOperationDTO[];
}

const statusLabel: Record<string, string> = {
    IN_PROGRESS: 'В процессе',
    SUCCESS: 'Успех',
    FAILED: 'Ошибка',
};

const statusClass: Record<string, string> = {
    IN_PROGRESS: 'border-sky-500/60 bg-sky-500/10 text-sky-200',
    SUCCESS: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-200',
    FAILED: 'border-rose-500/60 bg-rose-500/10 text-rose-200',
};

const ImportHistoryTable: React.FC<Props> = ({ items }) => {
    const formatDate = (iso?: string | null) => {
        if (!iso) return '—';
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return iso;
        return d.toLocaleString('ru-RU');
    };

    const formatBytes = (bytes?: number | null) => {
        if (!bytes || bytes <= 0) return '';
        const units = ['B', 'KB', 'MB', 'GB'];
        let v = bytes;
        let i = 0;
        while (v >= 1024 && i < units.length - 1) {
            v /= 1024;
            i += 1;
        }
        const fixed = i === 0 ? String(Math.round(v)) : v.toFixed(1);
        return `${fixed} ${units[i]}`;
    };

    const downloadFile = async (op: ImportOperationDTO) => {
        try {
            const resp = await importsApi.downloadImportFile(op.id);

            const blob = resp.data;
            const objectUrl = window.URL.createObjectURL(blob);

            const fallbackName = op.fileOriginalName || `import-${op.id}.bin`;
            const cd = String(resp.headers?.['content-disposition'] ?? '');
            const match = cd.match(/filename\*?=(?:UTF-8''|"?)([^";]+)/i);
            const filename = match?.[1]
                ? decodeURIComponent(match[1].replace(/"/g, '').trim())
                : fallbackName;

            const a = document.createElement('a');
            a.href = objectUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(objectUrl);
        } catch (e: any) {
            const status = e?.response?.status;
            if (status === 403) toast.error('Нет прав на скачивание этого файла');
            else if (status === 404) toast.error('Файл не найден');
            else toast.error('Не удалось скачать файл');
        }
    };

    return (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
            <table className="min-w-full text-xs sm:text-sm">
                <thead className="bg-slate-950/60">
                <tr className="text-slate-300">
                    <th className="px-3 py-2 text-left font-medium">ID</th>
                    <th className="px-3 py-2 text-left font-medium">Тип объекта</th>
                    <th className="px-3 py-2 text-left font-medium">Пользователь</th>
                    <th className="px-3 py-2 text-left font-medium">Статус</th>
                    <th className="px-3 py-2 text-right font-medium">
                        Добавлено объектов
                    </th>
                    <th className="px-3 py-2 text-left font-medium">Начато</th>
                    <th className="px-3 py-2 text-left font-medium">Завершено</th>
                    <th className="px-3 py-2 text-left font-medium">Ошибка</th>
                    <th className="px-3 py-2 text-left font-medium">Файл</th>
                </tr>
                </thead>
                <tbody>
                {items.map((op) => (
                    <tr
                        key={op.id}
                        className="border-t border-slate-800 hover:bg-slate-800/50"
                    >
                        <td className="px-3 py-2 align-middle">{op.id}</td>
                        <td className="px-3 py-2 align-middle">
                            {op.objectType || 'ROUTE'}
                        </td>
                        <td className="px-3 py-2 align-middle">{op.username}</td>
                        <td className="px-3 py-2 align-middle">
                                <span
                                    className={[
                                        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
                                        statusClass[op.status] ??
                                        'border-slate-500/60 bg-slate-500/10 text-slate-200',
                                    ].join(' ')}
                                >
                                    {statusLabel[op.status] ?? op.status}
                                </span>
                        </td>
                        <td className="px-3 py-2 text-right align-middle">
                            {op.status === 'SUCCESS'
                                ? op.importedCount ?? 0
                                : '—'}
                        </td>
                        <td className="px-3 py-2 align-middle">
                            {formatDate(op.startedAt)}
                        </td>
                        <td className="px-3 py-2 align-middle">
                            {formatDate(op.finishedAt)}
                        </td>
                        <td className="px-3 py-2 align-middle max-w-[260px] truncate">
                            {op.errorMessage ?? '—'}
                        </td>

                        <td className="px-3 py-2 align-middle">
                            {op.fileObjectKey ? (
                                <button
                                    className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs text-slate-200 hover:bg-slate-800"
                                    onClick={() => downloadFile(op)}
                                    title={op.fileOriginalName ?? undefined}
                                >
                                    Скачать{op.fileSizeBytes ? ` (${formatBytes(op.fileSizeBytes)})` : ''}
                                </button>
                            ) : (
                                <span className="text-slate-500">—</span>
                            )}
                        </td>
                    </tr>
                ))}

                {items.length === 0 && (
                    <tr>
                        <td
                            className="px-3 py-6 text-center text-slate-400"
                            colSpan={9}
                        >
                            Операций импорта пока нет
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default ImportHistoryTable;