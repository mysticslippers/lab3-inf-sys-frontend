import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { routesApi } from '../api/routesApi';
import type { RouteDTO } from '../types/route';
import RoutesTable from '../components/routes/RoutesTable';
import AddBetweenRouteModal from '../components/routes/AddBetweenRouteModal';

interface RatingGroup {
    rating: number;
    count: number;
}

const SpecialOperationsPage: React.FC = () => {
    const locationsState = useSelector((state: RootState) => state.locations);
    const locations = locationsState.items;

    const [minRoute, setMinRoute] = useState<RouteDTO | null>(null);
    const [minLoading, setMinLoading] = useState(false);
    const [minError, setMinError] = useState<string | null>(null);

    const [groups, setGroups] = useState<RatingGroup[] | null>(null);
    const [groupLoading, setGroupLoading] = useState(false);
    const [groupError, setGroupError] = useState<string | null>(null);

    const [uniqueRatings, setUniqueRatings] = useState<number[] | null>(null);
    const [uniqueLoading, setUniqueLoading] = useState(false);
    const [uniqueError, setUniqueError] = useState<string | null>(null);

    const [fromId, setFromId] = useState<number | ''>('');
    const [toId, setToId] = useState<number | ''>('');
    const [sortBy, setSortBy] = useState<'id' | 'distance' | 'rating' | 'name'>(
        'id'
    );
    const [betweenRoutes, setBetweenRoutes] = useState<RouteDTO[] | null>(null);
    const [betweenLoading, setBetweenLoading] = useState(false);
    const [betweenError, setBetweenError] = useState<string | null>(null);

    const [betweenModalOpen, setBetweenModalOpen] = useState(false);

    const handleLoadMinRoute = async () => {
        setMinLoading(true);
        setMinError(null);
        try {
            const route = await routesApi.getMinDistanceRoute();
            setMinRoute(route);
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ??
                err?.message ??
                'Не удалось получить маршрут с минимальной дистанцией';
            setMinError(msg);
            setMinRoute(null);
        } finally {
            setMinLoading(false);
        }
    };

    const handleLoadGroups = async () => {
        setGroupLoading(true);
        setGroupError(null);
        try {
            const map = await routesApi.getGroupedByRating();
            const result: RatingGroup[] = Object.entries(map)
                .map(([rating, count]) => ({
                    rating: Number(rating),
                    count: Number(count),
                }))
                .sort((a, b) => a.rating - b.rating);
            setGroups(result);
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ??
                err?.message ??
                'Не удалось получить группировку по рейтингу';
            setGroupError(msg);
            setGroups(null);
        } finally {
            setGroupLoading(false);
        }
    };

    const handleLoadUniqueRatings = async () => {
        setUniqueLoading(true);
        setUniqueError(null);
        try {
            const arr = await routesApi.getUniqueRatings();
            setUniqueRatings([...arr].sort((a, b) => a - b));
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ??
                err?.message ??
                'Не удалось получить список уникальных рейтингов';
            setUniqueError(msg);
            setUniqueRatings(null);
        } finally {
            setUniqueLoading(false);
        }
    };

    const handleFindBetween = async () => {
        setBetweenError(null);

        if (!fromId || !toId) {
            setBetweenError('Нужно выбрать обе локации: From и To');
            setBetweenRoutes(null);
            return;
        }

        setBetweenLoading(true);
        try {
            const routes = await routesApi.findBetween(
                Number(fromId),
                Number(toId),
                sortBy
            );
            setBetweenRoutes(routes);
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ??
                err?.message ??
                'Не удалось найти маршруты между локациями';
            setBetweenError(msg);
            setBetweenRoutes(null);
        } finally {
            setBetweenLoading(false);
        }
    };

    const fromIdNumber = typeof fromId === 'number' ? fromId : null;
    const toIdNumber = typeof toId === 'number' ? toId : null;

    return (
        <section className="space-y-8">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                        Маршрут с минимальной дистанцией
                    </h2>
                    <button
                        className="rounded-xl bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700"
                        onClick={handleLoadMinRoute}
                        disabled={minLoading}
                    >
                        {minLoading ? 'Загрузка...' : 'Показать'}
                    </button>
                </div>

                {minError && (
                    <div className="rounded-lg border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                        {minError}
                    </div>
                )}

                {minRoute && (
                    <RoutesTable
                        routes={[minRoute]}
                        onEdit={() => {}}
                        onDelete={() => {}}
                    />
                )}

                {!minRoute && !minError && !minLoading && (
                    <p className="text-sm text-slate-400">
                        Нажмите «Показать», чтобы загрузить маршрут.
                    </p>
                )}
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Группировка по rating</h2>
                    <button
                        className="rounded-xl bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700"
                        onClick={handleLoadGroups}
                        disabled={groupLoading}
                    >
                        {groupLoading ? 'Загрузка...' : 'Обновить'}
                    </button>
                </div>

                {groupError && (
                    <div className="rounded-lg border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                        {groupError}
                    </div>
                )}

                {groups && groups.length > 0 && (
                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
                        <table className="min-w-[280px] text-sm">
                            <thead className="bg-slate-950/60">
                            <tr>
                                <th className="px-3 py-2 text-left font-medium">
                                    Rating
                                </th>
                                <th className="px-3 py-2 text-left font-medium">
                                    Кол-во маршрутов
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {groups.map((g) => (
                                <tr
                                    key={g.rating}
                                    className="border-t border-slate-800 hover:bg-slate-800/50"
                                >
                                    <td className="px-3 py-2">{g.rating}</td>
                                    <td className="px-3 py-2">{g.count}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {(!groups || groups.length === 0) && !groupError && !groupLoading && (
                    <p className="text-sm text-slate-400">
                        Нажмите «Обновить», чтобы загрузить статистику.
                    </p>
                )}
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Уникальные значения rating</h2>
                    <button
                        className="rounded-xl bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700"
                        onClick={handleLoadUniqueRatings}
                        disabled={uniqueLoading}
                    >
                        {uniqueLoading ? 'Загрузка...' : 'Обновить'}
                    </button>
                </div>

                {uniqueError && (
                    <div className="rounded-lg border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                        {uniqueError}
                    </div>
                )}

                {uniqueRatings && uniqueRatings.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {uniqueRatings.map((r) => (
                            <span
                                key={r}
                                className="rounded-full border border-emerald-500/60 bg-emerald-500/10 px-3 py-1 text-xs"
                            >
                {r}
              </span>
                        ))}
                    </div>
                )}

                {(!uniqueRatings || uniqueRatings.length === 0) &&
                    !uniqueError &&
                    !uniqueLoading && (
                        <p className="text-sm text-slate-400">
                            Нажмите «Обновить», чтобы загрузить список.
                        </p>
                    )}
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                        Маршруты между двумя локациями
                    </h2>
                    <button
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
                        disabled={!fromIdNumber || !toIdNumber}
                        onClick={() => setBetweenModalOpen(true)}
                    >
                        Добавить маршрут между ними
                    </button>
                </div>

                <div className="grid gap-4 md:grid-cols-[2fr,2fr,1.5fr] text-sm">
                    <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                            From Location
                        </label>
                        <select
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                            value={fromId ?? ''}
                            onChange={(e) =>
                                setFromId(e.target.value ? Number(e.target.value) : '')
                            }
                        >
                            <option value="">— выберите локацию —</option>
                            {locations.map((l) => (
                                <option key={l.id} value={l.id ?? ''}>
                                    #{l.id} — x:{' '}
                                    {l.x != null ? l.x : 'null'}, y: {l.y}, z: {l.z}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                            To Location
                        </label>
                        <select
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                            value={toId ?? ''}
                            onChange={(e) =>
                                setToId(e.target.value ? Number(e.target.value) : '')
                            }
                        >
                            <option value="">— выберите локацию —</option>
                            {locations.map((l) => (
                                <option key={l.id} value={l.id ?? ''}>
                                    #{l.id} — x:{' '}
                                    {l.x != null ? l.x : 'null'}, y: {l.y}, z: {l.z}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                            Сортировка
                        </label>
                        <select
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                            value={sortBy}
                            onChange={(e) =>
                                setSortBy(e.target.value as 'id' | 'distance' | 'rating' | 'name')
                            }
                        >
                            <option value="id">По id (по умолчанию)</option>
                            <option value="distance">По distance</option>
                            <option value="rating">По rating</option>
                            <option value="name">По name</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        className="rounded-xl bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700 disabled:opacity-60"
                        onClick={handleFindBetween}
                        disabled={betweenLoading}
                    >
                        {betweenLoading ? 'Поиск...' : 'Найти маршруты'}
                    </button>
                    {betweenError && (
                        <span className="text-sm text-rose-400">{betweenError}</span>
                    )}
                </div>

                {betweenRoutes && (
                    <RoutesTable
                        routes={betweenRoutes}
                        onEdit={() => {}}
                        onDelete={() => {}}
                    />
                )}

                {!betweenRoutes &&
                    !betweenError &&
                    !betweenLoading &&
                    (fromIdNumber || toIdNumber) && (
                        <p className="text-sm text-slate-400">
                            Заполните оба поля и нажмите «Найти маршруты».
                        </p>
                    )}
            </div>

            <AddBetweenRouteModal
                open={betweenModalOpen}
                fromId={fromIdNumber}
                toId={toIdNumber}
                locations={locations}
                onClose={() => setBetweenModalOpen(false)}
            />
        </section>
    );
};

export default SpecialOperationsPage;
