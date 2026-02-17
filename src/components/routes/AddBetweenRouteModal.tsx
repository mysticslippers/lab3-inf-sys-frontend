import React, { useEffect, useState } from 'react';
import type { LocationDTO } from '../../types/location';
import type { RouteDTO } from '../../types/route';
import type { CoordinatesDTO } from '../../types/coordinates';
import { routesApi } from '../../api/routesApi';

interface Props {
    open: boolean;
    fromId: number | null;
    toId: number | null;
    locations: LocationDTO[];
    onClose: () => void;
}

interface Errors {
    name?: string;
    rating?: string;
    distance?: string;
    coordX?: string;
    coordY?: string;
    global?: string;
}

const AddBetweenRouteModal: React.FC<Props> = ({
                                                   open,
                                                   fromId,
                                                   toId,
                                                   locations,
                                                   onClose,
                                               }) => {
    const [name, setName] = useState('');
    const [rating, setRating] = useState('');
    const [distance, setDistance] = useState('');
    const [coordX, setCoordX] = useState('');
    const [coordY, setCoordY] = useState('');

    const [errors, setErrors] = useState<Errors>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setName('');
            setRating('');
            setDistance('');
            setCoordX('');
            setCoordY('');
            setErrors({});
        }
    }, [open]);

    if (!open) return null;

    const validate = (): boolean => {
        const next: Errors = {};

        if (!fromId || !toId) {
            next.global = 'Выберите локации "From" и "To" выше.';
        }

        if (!name.trim()) {
            next.name = 'Название обязательно';
        }

        if (!rating.trim()) {
            next.rating = 'Рейтинг обязателен';
        } else {
            const r = Number(rating);
            if (Number.isNaN(r)) {
                next.rating = 'Рейтинг должен быть числом';
            } else if (r <= 0) {
                next.rating = 'Рейтинг должен быть больше 0';
            }
        }

        if (distance.trim()) {
            const d = Number(distance);
            if (Number.isNaN(d)) {
                next.distance = 'Дистанция должна быть числом';
            } else if (d <= 1) {
                next.distance = 'Дистанция должна быть больше 1';
            }
        }

        if (!coordX.trim()) {
            next.coordX = 'X обязателен';
        } else if (Number.isNaN(Number(coordX))) {
            next.coordX = 'X должен быть числом (Double)';
        }

        if (!coordY.trim()) {
            next.coordY = 'Y обязателен';
        } else {
            const yVal = Number(coordY);
            if (Number.isNaN(yVal)) {
                next.coordY = 'Y должен быть числом (Float)';
            } else if (yVal <= -976) {
                next.coordY = 'Y должен быть больше -976';
            }
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleClose = () => {
        if (submitting) return;
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        if (!fromId || !toId) {
            return;
        }

        const from = locations.find((l) => l.id === fromId);
        const to = locations.find((l) => l.id === toId);

        if (!from || !to) {
            setErrors({
                ...errors,
                global: 'Выбранные локации не найдены в списке',
            });
            return;
        }

        const coordinates: CoordinatesDTO = {
            x: Number(coordX),
            y: Number(coordY),
        };

        const dto: RouteDTO = {
            name: name.trim(),
            rating: Number(rating),
            distance: distance.trim() ? Number(distance) : undefined,
            coordinates,
            from,
            to,
        };

        setSubmitting(true);
        try {
            await routesApi.addBetween(fromId, toId, dto);
            handleClose();
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ??
                err?.message ??
                'Не удалось добавить маршрут между локациями';
            setErrors((prev) => ({ ...prev, global: msg }));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="relative w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
                <button
                    className="absolute right-4 top-4 text-slate-500 hover:text-slate-300"
                    type="button"
                    onClick={handleClose}
                >
                    ✕
                </button>

                <h3 className="mb-4 text-lg font-semibold">
                    Добавить маршрут между локациями
                </h3>

                {errors.global && (
                    <div className="mb-3 rounded-lg border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                        {errors.global}
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
                                <p className="mt-1 text-xs text-rose-400">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                                Рейтинг (&gt; 0) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                                value={rating}
                                onChange={(e) => setRating(e.target.value)}
                            />
                            {errors.rating && (
                                <p className="mt-1 text-xs text-rose-400">{errors.rating}</p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                                Дистанция (&gt; 1, опционально)
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
                            Координаты маршрута
                        </legend>

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
                                    Y (Float, &gt; -976) *
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
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
                            disabled={submitting}
                        >
                            {submitting ? 'Создание...' : 'Создать маршрут'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddBetweenRouteModal;
