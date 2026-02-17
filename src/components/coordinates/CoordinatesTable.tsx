import React from 'react';
import type { CoordinatesDTO } from '../../types/coordinates';

interface Props {
    items: CoordinatesDTO[];
    onEdit: (item: CoordinatesDTO) => void;
    onDelete: (item: CoordinatesDTO) => void;
}

const CoordinatesTable: React.FC<Props> = ({ items, onEdit, onDelete }) => {
    return (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
            <table className="min-w-full text-sm">
                <thead className="bg-slate-950/60">
                <tr>
                    <th className="px-3 py-2 text-left font-medium">ID</th>
                    <th className="px-3 py-2 text-left font-medium">X</th>
                    <th className="px-3 py-2 text-left font-medium">Y</th>
                    <th className="px-3 py-2 text-right font-medium">Actions</th>
                </tr>
                </thead>
                <tbody>
                {items.map((c) => (
                    <tr
                        key={c.id}
                        className="border-t border-slate-800 hover:bg-slate-800/50"
                    >
                        <td className="px-3 py-2">{c.id}</td>
                        <td className="px-3 py-2">{c.x}</td>
                        <td className="px-3 py-2">{c.y}</td>
                        <td className="px-3 py-2 text-right space-x-2">
                            <button
                                className="rounded-lg border border-emerald-500/60 px-2 py-1 text-xs hover:bg-emerald-500/10"
                                onClick={() => onEdit(c)}
                            >
                                Изменить
                            </button>
                            <button
                                className="rounded-lg border border-rose-500/60 px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/10"
                                onClick={() => onDelete(c)}
                            >
                                Удалить
                            </button>
                        </td>
                    </tr>
                ))}

                {items.length === 0 && (
                    <tr>
                        <td
                            colSpan={4}
                            className="px-3 py-6 text-center text-slate-400"
                        >
                            Координат пока нет
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default CoordinatesTable;
