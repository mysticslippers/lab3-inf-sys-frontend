import React from 'react';
import type { RouteDTO } from '../../types/route';
import type { CoordinatesDTO } from '../../types/coordinates';
import type { LocationDTO } from '../../types/location';

interface Props {
    routes: RouteDTO[];
    onEdit: (route: RouteDTO) => void;
    onDelete: (route: RouteDTO) => void;
}

const RoutesTable: React.FC<Props> = ({ routes, onEdit, onDelete }) => {
    const formatCoords = (coords?: CoordinatesDTO | null) => {
        if (!coords) return '—';
        const { id, x, y } = coords;
        const pair = `(${x ?? 'null'}, ${y ?? 'null'})`;
        return id != null ? `#${id} ${pair}` : pair;
    };

    const formatLocation = (loc?: LocationDTO | null) => {
        if (!loc) return '—';
        const { id, x, y, z } = loc as LocationDTO;
        const triple = `(${x ?? 'null'}, ${y}, ${z})`;
        return id != null ? `#${id} ${triple}` : triple;
    };

    const formatDate = (iso?: string | null) => {
        if (!iso) return '—';
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return iso;
        return d.toLocaleString('ru-RU');
    };

    return (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 shadow-sm">
            <table className="min-w-full text-xs sm:text-sm">
                <thead className="bg-slate-950/80">
                <tr className="text-slate-300">
                    <th className="px-3 py-2 text-left font-medium">ID</th>
                    <th className="px-3 py-2 text-left font-medium">Название</th>
                    <th className="px-3 py-2 text-right font-medium">Рейтинг</th>
                    <th className="px-3 py-2 text-right font-medium">Дистанция</th>
                    <th className="px-3 py-2 text-left font-medium">Координаты</th>
                    <th className="px-3 py-2 text-left font-medium">From</th>
                    <th className="px-3 py-2 text-left font-medium">To</th>
                    <th className="px-3 py-2 text-left font-medium whitespace-nowrap">
                        Создан
                    </th>
                    <th className="px-3 py-2 text-right font-medium">Действия</th>
                </tr>
                </thead>
                <tbody>
                {routes.map((r, index) => (
                    <tr
                        key={r.id ?? index}
                        className="border-t border-slate-800 odd:bg-slate-900/40 even:bg-slate-900/70 hover:bg-slate-800/70 transition-colors"
                    >
                        <td className="px-3 py-2 align-middle text-slate-200">
                            {r.id}
                        </td>

                        <td
                            className="px-3 py-2 max-w-[220px] truncate align-middle text-slate-100"
                            title={r.name ?? ''}
                        >
                            {r.name}
                        </td>

                        <td className="px-3 py-2 text-right align-middle">
                <span className="inline-flex items-center justify-end rounded-full border border-emerald-500/60 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-200">
                  {r.rating}
                </span>
                        </td>

                        <td className="px-3 py-2 text-right align-middle">
                            {r.distance != null ? (
                                r.distance
                            ) : (
                                <span className="text-slate-500">null</span>
                            )}
                        </td>

                        <td className="px-3 py-2 align-middle whitespace-nowrap text-slate-200">
                            {formatCoords(r.coordinates as CoordinatesDTO | undefined)}
                        </td>

                        <td className="px-3 py-2 align-middle whitespace-nowrap text-slate-200">
                            {formatLocation(r.from as LocationDTO | undefined)}
                        </td>

                        <td className="px-3 py-2 align-middle whitespace-nowrap text-slate-200">
                            {formatLocation(r.to as LocationDTO | undefined)}
                        </td>

                        <td className="px-3 py-2 align-middle whitespace-nowrap text-slate-300">
                            {formatDate(r.creationDate as string | undefined)}
                        </td>

                        <td className="px-3 py-2 text-right align-middle">
                            <div className="inline-flex items-center gap-2">
                                <button
                                    className="rounded-lg border border-slate-600 px-2 py-1 text-[11px] font-medium text-slate-100 hover:border-emerald-500 hover:bg-emerald-500/10"
                                    onClick={() => onEdit(r)}
                                >
                                    Изменить
                                </button>
                                <button
                                    className="rounded-lg border border-rose-600/80 px-2 py-1 text-[11px] font-medium text-rose-200 hover:bg-rose-600/10"
                                    onClick={() => onDelete(r)}
                                >
                                    Удалить
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}

                {routes.length === 0 && (
                    <tr>
                        <td
                            colSpan={9}
                            className="px-3 py-6 text-center text-slate-400"
                        >
                            Маршрутов пока нет
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default RoutesTable;
