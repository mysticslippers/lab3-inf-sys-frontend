import React, { useEffect, useState } from 'react';
import type { RouteDTO } from '../../types/route';
import Spinner from '../common/Spinner';
import type { LocationDTO } from '../../types/location';
import type { CoordinatesDTO } from '../../types/coordinates';
import { locationsApi } from '../../api/locationsApi';
import { coordinatesApi } from '../../api/coordinatesApi';

interface RouteFormModalProps {
    open: boolean;
    initialRoute?: RouteDTO | null;
    onClose: () => void;
    onSubmit: (dto: RouteDTO) => Promise<void> | void;
}

type Mode = 'existing' | 'new';

interface Errors {
    [key: string]: string | undefined;
}

const RouteFormModal: React.FC<RouteFormModalProps> = ({
                                                           open,
                                                           initialRoute,
                                                           onClose,
                                                           onSubmit,
                                                       }) => {

    const [locations, setLocations] = useState<LocationDTO[]>([]);
    const [coordinatesList, setCoordinatesList] = useState<CoordinatesDTO[]>([]);

    const [loadingRefs, setLoadingRefs] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const isEdit = Boolean(initialRoute?.id);


    const [name, setName] = useState(initialRoute?.name ?? '');
    const [rating, setRating] = useState(
        initialRoute?.rating != null ? String(initialRoute.rating) : ''
    );
    const [distance, setDistance] = useState(
        initialRoute?.distance != null ? String(initialRoute.distance) : ''
    );

    const [coordinatesMode, setCoordinatesMode] = useState<Mode>(
        initialRoute?.coordinates?.id ? 'existing' : 'new'
    );
    const [coordinatesId, setCoordinatesId] = useState<
        number | '' | undefined
    >(initialRoute?.coordinates?.id ?? '');
    const [coordX, setCoordX] = useState(
        initialRoute?.coordinates?.x != null
            ? String(initialRoute.coordinates.x)
            : ''
    );
    const [coordY, setCoordY] = useState(
        initialRoute?.coordinates?.y != null
            ? String(initialRoute.coordinates.y)
            : ''
    );

    const [fromMode, setFromMode] = useState<Mode>(
        initialRoute?.from?.id ? 'existing' : 'new'
    );
    const [fromId, setFromId] = useState<number | '' | undefined>(
        initialRoute?.from?.id ?? ''
    );
    const [fromX, setFromX] = useState(
        initialRoute?.from?.x != null ? String(initialRoute.from.x) : ''
    );
    const [fromY, setFromY] = useState(
        initialRoute?.from?.y != null ? String(initialRoute.from.y) : ''
    );
    const [fromZ, setFromZ] = useState(
        initialRoute?.from?.z != null ? String(initialRoute.from.z) : ''
    );

    const [toMode, setToMode] = useState<Mode>(
        initialRoute?.to?.id ? 'existing' : 'new'
    );
    const [toId, setToId] = useState<number | '' | undefined>(
        initialRoute?.to?.id ?? ''
    );
    const [toX, setToX] = useState(
        initialRoute?.to?.x != null ? String(initialRoute.to.x) : ''
    );
    const [toY, setToY] = useState(
        initialRoute?.to?.y != null ? String(initialRoute.to.y) : ''
    );
    const [toZ, setToZ] = useState(
        initialRoute?.to?.z != null ? String(initialRoute.to.z) : ''
    );

    const [errors, setErrors] = useState<Errors>({});


    useEffect(() => {
        if (!open) return;

        setLoadingRefs(true);
        Promise.all([locationsApi.getAll(), coordinatesApi.getAll()])
            .then(([locs, coords]) => {
                setLocations(locs);
                setCoordinatesList(coords);
            })
            .catch((e) => {
                console.error('Error loading ref data', e);
            })
            .finally(() => setLoadingRefs(false));
    }, [open]);


    const validate = (): boolean => {
        const nextErrors: Errors = {};

        if (!name.trim()) {
            nextErrors.name = 'Название обязательно';
        }

        if (!rating.trim()) {
            nextErrors.rating = 'Рейтинг обязателен';
        } else {
            const r = Number(rating);
            if (Number.isNaN(r)) {
                nextErrors.rating = 'Рейтинг должен быть числом';
            } else if (r <= 0) {
                nextErrors.rating = 'Рейтинг должен быть больше 0';
            }
        }

        if (distance.trim()) {
            const d = Number(distance);
            if (Number.isNaN(d)) {
                nextErrors.distance = 'Дистанция должна быть числом';
            } else if (d <= 1) {
                nextErrors.distance = 'Дистанция должна быть больше 1';
            }
        }

        if (coordinatesMode === 'existing') {
            if (!coordinatesId) {
                nextErrors.coordinatesId = 'Выберите координаты';
            }
        } else {
            if (!coordX.trim()) {
                nextErrors.coordX = 'X обязателен';
            } else if (Number.isNaN(Number(coordX))) {
                nextErrors.coordX = 'X должен быть числом';
            }
            if (!coordY.trim()) {
                nextErrors.coordY = 'Y обязателен';
            } else if (Number.isNaN(Number(coordY))) {
                nextErrors.coordY = 'Y должен быть числом';
            }
        }

        if (fromMode === 'existing') {
            if (!fromId) {
                nextErrors.fromId = 'Выберите локацию';
            }
        } else {
            if (!fromX.trim()) {
                nextErrors.fromX = 'X обязателен';
            } else if (!Number.isInteger(Number(fromX))) {
                nextErrors.fromX = 'X должен быть целым числом';
            }
            if (!fromY.trim()) {
                nextErrors.fromY = 'Y обязателен';
            } else if (!Number.isInteger(Number(fromY))) {
                nextErrors.fromY = 'Y должен быть целым числом';
            }
            if (!fromZ.trim()) {
                nextErrors.fromZ = 'Z обязателен';
            } else if (Number.isNaN(Number(fromZ))) {
                nextErrors.fromZ = 'Z должен быть числом';
            }
        }

        if (toMode === 'existing') {
            if (!toId) {
                nextErrors.toId = 'Выберите локацию';
            }
        } else {
            if (!toX.trim()) {
                nextErrors.toX = 'X обязателен';
            } else if (!Number.isInteger(Number(toX))) {
                nextErrors.toX = 'X должен быть целым числом';
            }
            if (!toY.trim()) {
                nextErrors.toY = 'Y обязателен';
            } else if (!Number.isInteger(Number(toY))) {
                nextErrors.toY = 'Y должен быть целым числом';
            }
            if (!toZ.trim()) {
                nextErrors.toZ = 'Z обязателен';
            } else if (Number.isNaN(Number(toZ))) {
                nextErrors.toZ = 'Z должен быть числом';
            }
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const resetForm = () => {
        setName(initialRoute?.name ?? '');
        setRating(
            initialRoute?.rating != null ? String(initialRoute.rating) : ''
        );
        setDistance(
            initialRoute?.distance != null ? String(initialRoute.distance) : ''
        );
        setCoordinatesMode(initialRoute?.coordinates?.id ? 'existing' : 'new');
        setCoordinatesId(initialRoute?.coordinates?.id ?? '');
        setCoordX(
            initialRoute?.coordinates?.x != null
                ? String(initialRoute.coordinates.x)
                : ''
        );
        setCoordY(
            initialRoute?.coordinates?.y != null
                ? String(initialRoute.coordinates.y)
                : ''
        );
        setFromMode(initialRoute?.from?.id ? 'existing' : 'new');
        setFromId(initialRoute?.from?.id ?? '');
        setFromX(
            initialRoute?.from?.x != null ? String(initialRoute.from.x) : ''
        );
        setFromY(
            initialRoute?.from?.y != null ? String(initialRoute.from.y) : ''
        );
        setFromZ(
            initialRoute?.from?.z != null ? String(initialRoute.from.z) : ''
        );
        setToMode(initialRoute?.to?.id ? 'existing' : 'new');
        setToId(initialRoute?.to?.id ?? '');
        setToX(
            initialRoute?.to?.x != null ? String(initialRoute.to.x) : ''
        );
        setToY(
            initialRoute?.to?.y != null ? String(initialRoute.to.y) : ''
        );
        setToZ(
            initialRoute?.to?.z != null ? String(initialRoute.to.z) : ''
        );
        setErrors({});
        setSubmitError(null);
    };

    useEffect(() => {
        if (open) {
            resetForm();
        }
    }, [open, initialRoute?.id]);

    if (!open) return null;

    const handleClose = () => {
        if (submitting) return;
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        if (!validate()) return;

        const ratingNum = Number(rating);
        const distanceNum = distance.trim() ? Number(distance) : undefined;

        let coordinates: CoordinatesDTO;
        if (coordinatesMode === 'existing') {
            const found = coordinatesList.find((c) => c.id === coordinatesId);
            if (!found) {
                setSubmitError('Выбранные координаты не найдены');
                return;
            }
            coordinates = { ...found };
        } else {
            coordinates = {
                id: initialRoute?.coordinates?.id,
                x: Number(coordX),
                y: Number(coordY),
            };
        }

        let from: LocationDTO;
        if (fromMode === 'existing') {
            const found = locations.find((l) => l.id === fromId);
            if (!found) {
                setSubmitError('Выбранная локация "from" не найдена');
                return;
            }
            from = { ...found };
        } else {
            from = {
                id: initialRoute?.from?.id,
                x: Number(fromX),
                y: Number(fromY),
                z: Number(fromZ),
            };
        }

        let to: LocationDTO;
        if (toMode === 'existing') {
            const found = locations.find((l) => l.id === toId);
            if (!found) {
                setSubmitError('Выбранная локация "to" не найдена');
                return;
            }
            to = { ...found };
        } else {
            to = {
                id: initialRoute?.to?.id,
                x: Number(toX),
                y: Number(toY),
                z: Number(toZ),
            };
        }

        const dto: RouteDTO = {
            id: initialRoute?.id,
            name: name.trim(),
            rating: ratingNum,
            distance: distanceNum,
            coordinates,
            from,
            to,
            creationDate: initialRoute?.creationDate,
        };

        setSubmitting(true);
        try {
            await onSubmit(dto);
            handleClose();
        } catch (err: any) {
            console.error(err);
            setSubmitError(
                err?.message ?? 'Не удалось сохранить маршрут. Проверьте данные.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
            <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
                <button
                    className="absolute right-4 top-4 text-slate-500 hover:text-slate-300"
                    onClick={handleClose}
                    type="button"
                >
                    ✕
                </button>

                <h3 className="mb-4 text-lg font-semibold">
                    {isEdit ? 'Редактировать маршрут' : 'Создать маршрут'}
                </h3>

                {loadingRefs && (
                    <div className="mb-3 text-sm text-slate-400">
                        Загрузка доступных координат и локаций...
                    </div>
                )}

                {submitError && (
                    <div className="mb-3 rounded-lg border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                        {submitError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                                Название *
                            </label>
                            <input
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            {errors.name && (
                                <p className="mt-1 text-xs text-rose-400">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                                Рейтинг ( {'>'} 0 ) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                                value={rating}
                                onChange={(e) => setRating(e.target.value)}
                            />
                            {errors.rating && (
                                <p className="mt-1 text-xs text-rose-400">
                                    {errors.rating}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                                Дистанция ( {'>'} 1, опционально )
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                                value={distance}
                                onChange={(e) => setDistance(e.target.value)}
                            />
                            {errors.distance && (
                                <p className="mt-1 text-xs text-rose-400">
                                    {errors.distance}
                                </p>
                            )}
                        </div>
                    </div>

                    <fieldset className="rounded-xl border border-slate-700 p-4">
                        <legend className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Coordinates (обязательны)
                        </legend>

                        <div className="mb-2 flex gap-4 text-xs text-slate-300">
                            <label className="flex items-center gap-1">
                                <input
                                    type="radio"
                                    className="text-emerald-500"
                                    checked={coordinatesMode === 'existing'}
                                    onChange={() => setCoordinatesMode('existing')}
                                />
                                Использовать существующие
                            </label>
                            <label className="flex items-center gap-1">
                                <input
                                    type="radio"
                                    className="text-emerald-500"
                                    checked={coordinatesMode === 'new'}
                                    onChange={() => setCoordinatesMode('new')}
                                />
                                Создать новые
                            </label>
                        </div>

                        {coordinatesMode === 'existing' ? (
                            <div>
                                <select
                                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                                    value={coordinatesId ?? ''}
                                    onChange={(e) =>
                                        setCoordinatesId(
                                            e.target.value ? Number(e.target.value) : ''
                                        )
                                    }
                                >
                                    <option value="">— выберите координаты —</option>
                                    {coordinatesList.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            #{c.id} — x: {c.x}, y: {c.y}
                                        </option>
                                    ))}
                                </select>
                                {errors.coordinatesId && (
                                    <p className="mt-1 text-xs text-rose-400">
                                        {errors.coordinatesId}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="mt-2 grid gap-3 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs text-slate-400">
                                        X (Double) *
                                    </label>
                                    <input
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                                        value={coordX}
                                        onChange={(e) => setCoordX(e.target.value)}
                                    />
                                    {errors.coordX && (
                                        <p className="mt-1 text-xs text-rose-400">
                                            {errors.coordX}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-slate-400">
                                        Y (Float) *
                                    </label>
                                    <input
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                                        value={coordY}
                                        onChange={(e) => setCoordY(e.target.value)}
                                    />
                                    {errors.coordY && (
                                        <p className="mt-1 text-xs text-rose-400">
                                            {errors.coordY}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </fieldset>

                    {/* From location */}
                    <fieldset className="rounded-xl border border-slate-700 p-4">
                        <legend className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            From Location (обязательна)
                        </legend>

                        <div className="mb-2 flex gap-4 text-xs text-slate-300">
                            <label className="flex items-center gap-1">
                                <input
                                    type="radio"
                                    checked={fromMode === 'existing'}
                                    onChange={() => setFromMode('existing')}
                                />
                                Использовать существующую
                            </label>
                            <label className="flex items-center gap-1">
                                <input
                                    type="radio"
                                    checked={fromMode === 'new'}
                                    onChange={() => setFromMode('new')}
                                />
                                Создать новую
                            </label>
                        </div>

                        {fromMode === 'existing' ? (
                            <div>
                                <select
                                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                                    value={fromId ?? ''}
                                    onChange={(e) =>
                                        setFromId(
                                            e.target.value ? Number(e.target.value) : ''
                                        )
                                    }
                                >
                                    <option value="">— выберите локацию —</option>
                                    {locations.map((l) => (
                                        <option key={l.id} value={l.id}>
                                            #{l.id} — x: {l.x}, y: {l.y}, z: {l.z}
                                        </option>
                                    ))}
                                </select>
                                {errors.fromId && (
                                    <p className="mt-1 text-xs text-rose-400">
                                        {errors.fromId}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="mt-2 grid gap-3 md:grid-cols-3">
                                <div>
                                    <label className="mb-1 block text-xs text-slate-400">
                                        X (Long) *
                                    </label>
                                    <input
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                                        value={fromX}
                                        onChange={(e) => setFromX(e.target.value)}
                                    />
                                    {errors.fromX && (
                                        <p className="mt-1 text-xs text-rose-400">
                                            {errors.fromX}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-slate-400">
                                        Y (Long) *
                                    </label>
                                    <input
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                                        value={fromY}
                                        onChange={(e) => setFromY(e.target.value)}
                                    />
                                    {errors.fromY && (
                                        <p className="mt-1 text-xs text-rose-400">
                                            {errors.fromY}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-slate-400">
                                        Z (Double) *
                                    </label>
                                    <input
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                                        value={fromZ}
                                        onChange={(e) => setFromZ(e.target.value)}
                                    />
                                    {errors.fromZ && (
                                        <p className="mt-1 text-xs text-rose-400">
                                            {errors.fromZ}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </fieldset>

                    <fieldset className="rounded-xl border border-slate-700 p-4">
                        <legend className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            To Location (обязательна)
                        </legend>

                        <div className="mb-2 flex gap-4 text-xs text-slate-300">
                            <label className="flex items-center gap-1">
                                <input
                                    type="radio"
                                    checked={toMode === 'existing'}
                                    onChange={() => setToMode('existing')}
                                />
                                Использовать существующую
                            </label>
                            <label className="flex items-center gap-1">
                                <input
                                    type="radio"
                                    checked={toMode === 'new'}
                                    onChange={() => setToMode('new')}
                                />
                                Создать новую
                            </label>
                        </div>

                        {toMode === 'existing' ? (
                            <div>
                                <select
                                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                                    value={toId ?? ''}
                                    onChange={(e) =>
                                        setToId(
                                            e.target.value ? Number(e.target.value) : ''
                                        )
                                    }
                                >
                                    <option value="">— выберите локацию —</option>
                                    {locations.map((l) => (
                                        <option key={l.id} value={l.id}>
                                            #{l.id} — x: {l.x}, y: {l.y}, z: {l.z}
                                        </option>
                                    ))}
                                </select>
                                {errors.toId && (
                                    <p className="mt-1 text-xs text-rose-400">
                                        {errors.toId}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="mt-2 grid gap-3 md:grid-cols-3">
                                <div>
                                    <label className="mb-1 block text-xs text-slate-400">
                                        X (Long) *
                                    </label>
                                    <input
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                                        value={toX}
                                        onChange={(e) => setToX(e.target.value)}
                                    />
                                    {errors.toX && (
                                        <p className="mt-1 text-xs text-rose-400">
                                            {errors.toX}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-slate-400">
                                        Y (Long) *
                                    </label>
                                    <input
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                                        value={toY}
                                        onChange={(e) => setToY(e.target.value)}
                                    />
                                    {errors.toY && (
                                        <p className="mt-1 text-xs text-rose-400">
                                            {errors.toY}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-slate-400">
                                        Z (Double) *
                                    </label>
                                    <input
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                                        value={toZ}
                                        onChange={(e) => setToZ(e.target.value)}
                                    />
                                    {errors.toZ && (
                                        <p className="mt-1 text-xs text-rose-400">
                                            {errors.toZ}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </fieldset>

                    <div className="mt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            className="rounded-xl border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800"
                            onClick={handleClose}
                            disabled={submitting}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
                            disabled={submitting}
                        >
                            {submitting && <Spinner size="sm" />}
                            <span>{isEdit ? 'Сохранить' : 'Создать'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RouteFormModal;
