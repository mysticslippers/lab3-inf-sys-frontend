import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import type { LocationDTO } from '../types/location';

import LocationsTable from '../components/locations/LocationsTable';
import LocationFormModal from '../components/locations/LocationFormModal';
import Spinner from '../components/common/Spinner';

import { toast } from 'react-toastify';
import {
    fetchLocations,
    createLocation,
    updateLocation,
    deleteLocation,
} from '../store/locationsSlice';
import { locationsApi } from '../api/locationsApi';
import { getApiErrorMessage } from '../utils/errorUtils';

const LocationsPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { items, status, error } = useSelector(
        (state: RootState) => state.locations
    );

    const [modalOpen, setModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<LocationDTO | null>(
        null
    );

    const [searchId, setSearchId] = useState('');
    const [searchResult, setSearchResult] = useState<LocationDTO | null>(null);
    const [searchStatus, setSearchStatus] = useState<
        'idle' | 'loading' | 'succeeded' | 'failed'
    >('idle');
    const [searchError, setSearchError] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchLocations());
        }
    }, [dispatch, status]);


    const handleOpenCreate = () => {
        setEditingLocation(null);
        setModalOpen(true);
    };

    const handleEdit = (loc: LocationDTO) => {
        setEditingLocation(loc);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingLocation(null);
    };

    const handleSubmit = async (dto: LocationDTO) => {
        try {
            if (editingLocation && editingLocation.id != null) {
                await dispatch(
                    updateLocation({ id: editingLocation.id, dto })
                ).unwrap();
                toast.success('Локация обновлена');
            } else {
                await dispatch(createLocation(dto)).unwrap();
                toast.success('Локация создана');
            }
            handleCloseModal();
        } catch (err) {
            const msg = getApiErrorMessage(err, 'Ошибка при сохранении локации');
            toast.error(msg);
        }
    };

    const handleDelete = async (loc: LocationDTO) => {
        if (!loc.id) return;
        if (!window.confirm(`Удалить локацию #${loc.id}?`)) return;
        try {
            await dispatch(deleteLocation(loc.id)).unwrap();
            toast.success('Локация удалена');
        } catch (err) {
            const msg = getApiErrorMessage(
                err,
                'Не удалось удалить локацию'
            );
            toast.error(msg);
        }
    };


    const handleSearchById = async () => {
        setSearchError(null);
        setSearchResult(null);

        if (!searchId.trim()) {
            setSearchError('Введите ID локации');
            return;
        }

        const idNum = Number(searchId);
        if (!Number.isInteger(idNum) || idNum <= 0) {
            setSearchError('ID должен быть положительным целым числом');
            return;
        }

        setSearchStatus('loading');
        try {
            const loc = await locationsApi.getById(idNum);
            setSearchResult(loc);
            setSearchStatus('succeeded');
        } catch (err) {
            const msg = getApiErrorMessage(
                err,
                'Ошибка при получении локации'
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
                <h2 className="mb-2 text-xl font-semibold">Локации</h2>
                <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-3 text-slate-300">
                        <Spinner />
                        <span className="text-sm">Загружаем локации...</span>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Локации</h2>
                <button
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
                    onClick={handleOpenCreate}
                >
                    Добавить локацию
                </button>
            </div>

            {error && (
                <div className="rounded-lg border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                    {error}
                </div>
            )}

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm">
                <h3 className="mb-2 font-medium">Поиск локации по ID</h3>
                <div className="flex flex-wrap gap-2">
                    <input
                        className="min-w-[120px] flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                        placeholder="ID локации"
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
                            Результат поиска (локация с id={searchResult.id}):
                        </p>
                        <div className="rounded-xl border border-slate-800 bg-slate-950/70">
                            <LocationsTable
                                items={[searchResult]}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        </div>
                    </div>
                )}
            </div>

            <LocationsTable
                items={items}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {items.length === 0 &&
                !error &&
                status === 'succeeded' &&
                !searchResult && (
                    <p className="text-sm text-slate-400">
                        Локаций пока нет. Нажмите{' '}
                        <span className="font-medium text-emerald-400">
              «Добавить локацию»
            </span>
                        , чтобы создать первую.
                    </p>
                )}

            <LocationFormModal
                open={modalOpen}
                initialItem={editingLocation}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
            />
        </section>
    );
};

export default LocationsPage;
