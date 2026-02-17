import React, { useEffect, useState } from 'react';
import type { LocationDTO } from '../../types/location';
import Spinner from '../common/Spinner';

interface Props {
    open: boolean;
    initialItem?: LocationDTO | null;
    onClose: () => void;
    onSubmit: (dto: LocationDTO) => Promise<void> | void;
}

interface Errors {
    x?: string;
    y?: string;
    z?: string;
}

const LocationFormModal: React.FC<Props> = ({
                                                open,
                                                initialItem,
                                                onClose,
                                                onSubmit,
                                            }) => {
    const isEdit = Boolean(initialItem?.id);

    const [x, setX] = useState(
        initialItem?.x != null ? String(initialItem.x) : ''
    );
    const [y, setY] = useState(
        initialItem?.y != null ? String(initialItem.y) : ''
    );
    const [z, setZ] = useState(
        initialItem?.z != null ? String(initialItem.z) : ''
    );
    const [errors, setErrors] = useState<Errors>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setX(initialItem?.x != null ? String(initialItem.x) : '');
            setY(initialItem?.y != null ? String(initialItem.y) : '');
            setZ(initialItem?.z != null ? String(initialItem.z) : '');
            setErrors({});
            setSubmitError(null);
        }
    }, [open, initialItem?.id]);

    if (!open) return null;

    const validate = (): boolean => {
        const next: Errors = {};

        if (x.trim()) {
            if (!Number.isInteger(Number(x))) {
                next.x = 'X должен быть целым числом (Long) или пустым';
            }
        }

        if (!y.trim()) {
            next.y = 'Y обязателен';
        } else if (!Number.isInteger(Number(y))) {
            next.y = 'Y должен быть целым числом (Long)';
        }

        if (!z.trim()) {
            next.z = 'Z обязателен';
        } else if (Number.isNaN(Number(z))) {
            next.z = 'Z должен быть числом (Double)';
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
        setSubmitError(null);

        if (!validate()) return;

        const dto: LocationDTO = {
            id: initialItem?.id,
            x: x.trim() ? Number(x) : null as any,
            y: Number(y),
            z: Number(z),
        };

        setSubmitting(true);
        try {
            await onSubmit(dto);
            handleClose();
        } catch (err: any) {
            console.error(err);
            setSubmitError(
                err?.response?.data?.message ??
                err?.message ??
                'Не удалось сохранить локацию'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
            <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
                <button
                    className="absolute right-4 top-4 text-slate-500 hover:text-slate-300"
                    onClick={handleClose}
                    type="button"
                >
                    ✕
                </button>

                <h3 className="mb-4 text-lg font-semibold">
                    {isEdit ? 'Редактировать локацию' : 'Создать локацию'}
                </h3>

                {submitError && (
                    <div className="mb-3 rounded-lg border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                        {submitError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                    <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                            X (Long, опционально)
                        </label>
                        <input
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                            value={x}
                            onChange={(e) => setX(e.target.value)}
                        />
                        {errors.x && (
                            <p className="mt-1 text-xs text-rose-400">{errors.x}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                            Y (Long) *
                        </label>
                        <input
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                            value={y}
                            onChange={(e) => setY(e.target.value)}
                        />
                        {errors.y && (
                            <p className="mt-1 text-xs text-rose-400">{errors.y}</p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                            Z (Double) *
                        </label>
                        <input
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"
                            value={z}
                            onChange={(e) => setZ(e.target.value)}
                        />
                        {errors.z && (
                            <p className="mt-1 text-xs text-rose-400">{errors.z}</p>
                        )}
                    </div>

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
                            <span>
                                {isEdit ? 'Сохранить' : 'Создать'}
                            </span>
                        </button>

                    </div>
                </form>
            </div>
        </div>
    );
};

export default LocationFormModal;
