import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import type { RouteDTO } from '../types/route';
import { getApiErrorMessage } from '../utils/errorUtils';

import { routesApi } from '../api/routesApi';
import {
    fetchRoutesPage,
    createRoute,
    updateRoute,
    deleteRoute,
    setPageRequest,
} from '../store/routesSlice';

import RoutesTable from '../components/routes/RoutesTable';
import RouteFormModal from '../components/routes/RouteFormModal';
import RoutesPagination from '../components/routes/RoutesPagination';
import Spinner from '../components/common/Spinner';
import { toast } from 'react-toastify';

const RoutesPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { page, status, pageRequest, error } = useSelector(
        (state: RootState) => state.routes
    );

    const [modalOpen, setModalOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState<RouteDTO | null>(null);

    const [searchId, setSearchId] = useState('');
    const [searchResult, setSearchResult] = useState<RouteDTO | null>(null);
    const [searchStatus, setSearchStatus] = useState<
        'idle' | 'loading' | 'succeeded' | 'failed'
    >('idle');
    const [searchError, setSearchError] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchRoutesPage());
        }
    }, [dispatch, status]);


    const handleOpenCreate = () => {
        setEditingRoute(null);
        setModalOpen(true);
    };

    const handleEdit = (route: RouteDTO) => {
        setEditingRoute(route);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingRoute(null);
    };

    const handleSubmit = async (dto: RouteDTO) => {
        try {
            if (editingRoute && editingRoute.id != null) {
                await dispatch(
                    updateRoute({ id: editingRoute.id, dto })
                ).unwrap();
                toast.success('Маршрут обновлён');
            } else {
                await dispatch(createRoute(dto)).unwrap();
                toast.success('Маршрут создан');
            }
            handleCloseModal();
        } catch (err) {
            const msg = getApiErrorMessage(err, 'Ошибка при сохранении маршрута');
            toast.error(msg);
        }
    };

    const handleDelete = async (route: RouteDTO) => {
        if (!route.id) return;
        if (!window.confirm(`Удалить маршрут "${route.name}"?`)) return;

        try {
            await dispatch(deleteRoute(route.id)).unwrap();
            toast.success('Маршрут удалён');
        } catch (err) {
            const msg = getApiErrorMessage(err, 'Не удалось удалить маршрут');
            toast.error(msg);
        }
    };


    const handleSearchById = async () => {
        setSearchError(null);
        setSearchResult(null);

        if (!searchId.trim()) {
            setSearchError('Введите ID маршрута');
            return;
        }

        const idNum = Number(searchId);
        if (!Number.isInteger(idNum) || idNum <= 0) {
            setSearchError('ID должен быть положительным целым числом');
            return;
        }

        setSearchStatus('loading');
        try {
            const route = await routesApi.getById(idNum);
            setSearchResult(route);
            setSearchStatus('succeeded');
        } catch (err) {
            const msg = getApiErrorMessage(err, 'Ошибка при получении маршрута');
            setSearchError(msg);
        }
    };

    const handleResetSearch = () => {
        setSearchId('');
        setSearchResult(null);
        setSearchError(null);
        setSearchStatus('idle');
    };


    const handlePageChange = (newPage: number) => {
        dispatch(
            setPageRequest({
                ...pageRequest,
                page: newPage,
            })
        );
        dispatch(fetchRoutesPage());
    };


    if (status === 'loading' && !page) {
        return (
            <section className="space-y-4">
                <h2 className="text-xl font-semibold mb-2">Маршруты</h2>
                <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-3 text-slate-300">
                        <Spinner />
                        <span className="text-sm">Загружаем маршруты...</span>
                    </div>
                </div>
            </section>
        );
    }


    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Маршруты</h2>
                <button
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
                    onClick={handleOpenCreate}
                >
                    Добавить маршрут
                </button>
            </div>

            {error && (
                <div className="rounded-lg border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                    {error}
                </div>
            )}

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm">
                <h3 className="mb-2 font-medium">Поиск маршрута по ID</h3>
                <div className="flex flex-wrap gap-2">
                    <input
                        className="min-w-[120px] flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                        placeholder="ID маршрута"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchById()}
                    />
                    <button
                        className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-medium hover:bg-slate-700 disabled:opacity-60"
                        onClick={handleSearchById}
                        disabled={searchStatus === 'loading'}
                    >
                        {searchStatus === 'loading' ? 'Поиск...' : 'Найти'}
                    </button>
                    <button
                        className="rounded-xl border border-slate-600 px-3 py-2 text-xs hover:bg-slate-800"
                        onClick={handleResetSearch}
                    >
                        Сбросить
                    </button>
                </div>

                {searchError && (
                    <p className="mt-2 text-xs text-rose-400">{searchError}</p>
                )}

                {searchResult && (
                    <div className="mt-3">
                        <p className="mb-1 text-xs text-slate-400">
                            Результат поиска (маршрут с id={searchResult.id}):
                        </p>
                        <div className="rounded-xl border border-slate-800 bg-slate-950/70">
                            <RoutesTable
                                routes={[searchResult]}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        </div>
                    </div>
                )}
            </div>

            <RoutesTable
                routes={page?.content ?? []}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {page && page.content.length === 0 && status === 'succeeded' && (
                <p className="text-sm text-slate-400">
                    Маршрутов пока нет. Нажмите{' '}
                    <span className="font-medium text-emerald-400">
            «Добавить маршрут»
          </span>
                    , чтобы создать первый.
                </p>
            )}

            {page && page.totalPages > 1 && (
                <RoutesPagination
                    page={pageRequest.page}
                    size={pageRequest.size}
                    totalPages={page.totalPages}
                    onChange={handlePageChange}
                />
            )}

            <RouteFormModal
                open={modalOpen}
                initialRoute={editingRoute}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
            />
        </section>
    );
};

export default RoutesPage;
