import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import type { CoordinatesDTO } from '../types/coordinates';

import CoordinatesTable from '../components/coordinates/CoordinatesTable';
import CoordinatesFormModal from '../components/coordinates/CoordinatesFormModal';
import Spinner from '../components/common/Spinner';

import { toast } from 'react-toastify';
import {
    fetchCoordinates,
    createCoordinates,
    updateCoordinates,
    deleteCoordinates,
} from '../store/coordinatesSlice';
import { coordinatesApi } from '../api/coordinatesApi';
import { getApiErrorMessage } from '../utils/errorUtils';

const CoordinatesPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { items, status, error } = useSelector(
        (state: RootState) => state.coordinates
    );

    const [modalOpen, setModalOpen] = useState(false);
    const [editingCoords, setEditingCoords] = useState<CoordinatesDTO | null>(
        null
    );

    const [searchId, setSearchId] = useState('');
    const [searchResult, setSearchResult] = useState<CoordinatesDTO | null>(null);
    const [searchStatus, setSearchStatus] = useState<
        'idle' | 'loading' | 'succeeded' | 'failed'
    >('idle');
    const [searchError, setSearchError] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchCoordinates());
        }
    }, [dispatch, status]);


    const handleOpenCreate = () => {
        setEditingCoords(null);
        setModalOpen(true);
    };

    const handleEdit = (coord: CoordinatesDTO) => {
        setEditingCoords(coord);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingCoords(null);
    };

    const handleSubmit = async (dto: CoordinatesDTO) => {
        try {
            if (editingCoords && editingCoords.id != null) {
                await dispatch(
                    updateCoordinates({ id: editingCoords.id, dto })
                ).unwrap();
                toast.success('Координаты обновлены');
            } else {
                await dispatch(createCoordinates(dto)).unwrap();
                toast.success('Координаты созданы');
            }
            handleCloseModal();
        } catch (err) {
            const msg = getApiErrorMessage(
                err,
                'Ошибка при сохранении координат'
            );
            toast.error(msg);
        }
    };

    const handleDelete = async (coord: CoordinatesDTO) => {
        if (!coord.id) return;
        if (!window.confirm(`Удалить координаты #${coord.id}?`)) return;
        try {
            await dispatch(deleteCoordinates(coord.id)).unwrap();
            toast.success('Координаты удалены');
        } catch (err) {
            const msg = getApiErrorMessage(
                err,
                'Не удалось удалить координаты'
            );
            toast.error(msg);
        }
    };


    const handleSearchById = async () => {
        setSearchError(null);
        setSearchResult(null);

        if (!searchId.trim()) {
            setSearchError('Введите ID координат');
            return;
        }

        const idNum = Number(searchId);
        if (!Number.isInteger(idNum) || idNum <= 0) {
            setSearchError('ID должен быть положительным целым числом');
            return;
        }

        setSearchStatus('loading');
        try {
            const coord = await coordinatesApi.getById(idNum);
            setSearchResult(coord);
            setSearchStatus('succeeded');
        } catch (err) {
            const msg = getApiErrorMessage(
                err,
                'Ошибка при получении координат'
            );
            setSearchError(msg);
            setSearchStatus('failed');
        }
    };

    const handleResetSearch = () => {
        setSearchId('');
        setSearchResult(null);
        setSearchError(null);
        setSearchStatus('idle');
    };


    if (status === 'loading' && items.length === 0) {
        return (
            <section className="space-y-4">
                <h2 className="mb-2 text-xl font-semibold">Координаты</h2>
                <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-3 text-slate-300">
                        <Spinner />
                        <span className="text-sm">Загружаем координаты...</span>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Координаты</h2>
                <button
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
                    onClick={handleOpenCreate}
                >
                    Добавить координаты
                </button>
            </div>

            {error && (
                <div className="rounded-lg border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                    {error}
                </div>
            )}

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm">
                <h3 className="mb-2 font-medium">Поиск координат по ID</h3>
                <div className="flex flex-wrap gap-2">
                    <input
                        className="min-w-[120px] flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                        placeholder="ID координат"
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
                            Результат поиска (координаты с id={searchResult.id}):
                        </p>
                        <div className="rounded-xl border border-slate-800 bg-slate-950/70">
                            <CoordinatesTable
                                items={[searchResult]}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        </div>
                    </div>
                )}
            </div>

            <CoordinatesTable
                items={items}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {items.length === 0 &&
                !error &&
                status === 'succeeded' &&
                !searchResult && (
                    <p className="text-sm text-slate-400">
                        Координат пока нет. Нажмите{' '}
                        <span className="font-medium text-emerald-400">
              «Добавить координаты»
            </span>
                        , чтобы создать первую запись.
                    </p>
                )}

            <CoordinatesFormModal
                open={modalOpen}
                initialItem={editingCoords}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
            />
        </section>
    );
};

export default CoordinatesPage;
