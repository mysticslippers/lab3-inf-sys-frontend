import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Spinner from '../common/Spinner';
import { http } from '../../api/httpClient';

interface Props {
    open: boolean;
    onClose: () => void;
}

const ForgotPasswordModal: React.FC<Props> = ({ open, onClose }) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading'>('idle');

    useEffect(() => {
        if (!open) {
            setEmail('');
            setStatus('idle');
        }
    }, [open]);

    if (!open) return null;

    const handleClose = () => {
        if (status === 'loading') return;
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const value = email.trim();
        if (!value) return;

        setStatus('loading');
        try {
            await http.post('/password-reset/request', { email: value });
            // Анти-энумерация: одинаковый ответ и при существующем, и при несуществующем email
            toast.success('Если аккаунт существует — письмо для восстановления отправлено.');
            onClose();
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                'Не удалось отправить письмо. Попробуй позже.';
            toast.error(msg);
        } finally {
            setStatus('idle');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="relative w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
                <button
                    type="button"
                    onClick={handleClose}
                    className="absolute right-4 top-4 text-slate-500 hover:text-slate-300"
                >
                    ✕
                </button>

                <h3 className="mb-2 text-lg font-semibold">Восстановление пароля</h3>
                <p className="mb-4 text-sm text-slate-300">
                    Введи почту. Мы отправим ссылку для сброса пароля.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                    <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="mt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={status === 'loading'}
                            className="rounded-xl border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
                        >
                            {status === 'loading' && <Spinner size="sm" />}
                            <span>Отправить</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
