import React, { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import Spinner from '../components/common/Spinner';
import { http } from '../api/httpClient';

const ResetPasswordPage: React.FC = () => {
    const token = useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        return (params.get('token') || '').trim();
    }, []);

    const [newPassword, setNewPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading'>('idle');

    const canSubmit =
        token.length > 0 &&
        newPassword.length >= 6 &&
        newPassword === confirm &&
        status !== 'loading';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            toast.error('Токен не найден в ссылке.');
            return;
        }
        if (newPassword !== confirm) {
            toast.error('Пароли не совпадают.');
            return;
        }

        setStatus('loading');
        try {
            await http.post('/password-reset/confirm', { token, newPassword });
            toast.success('Пароль изменён. Теперь можно войти.');
            window.location.href = '/';
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                'Не удалось сменить пароль. Проверь ссылку или запроси восстановление заново.';
            toast.error(msg);
        } finally {
            setStatus('idle');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center px-6">
            <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-950/60 p-6 shadow-xl">
                <h2 className="text-xl font-semibold">Сброс пароля</h2>
                <p className="mt-2 text-sm text-slate-300">
                    Введи новый пароль. Ссылка должна содержать параметр <code>token</code>.
                </p>

                {!token && (
                    <div className="mt-4 rounded-lg border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                        В ссылке нет токена. Открой ссылку из письма или запроси восстановление ещё раз.
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-sm">
                    <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                            Новый пароль
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
                            autoComplete="new-password"
                            required
                            disabled={!token || status === 'loading'}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                            Повтори пароль
                        </label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
                            autoComplete="new-password"
                            required
                            disabled={!token || status === 'loading'}
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => (window.location.href = '/')}
                            className="rounded-xl border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800"
                            disabled={status === 'loading'}
                        >
                            На главную
                        </button>

                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
                        >
                            {status === 'loading' && <Spinner size="sm" />}
                            <span>Сохранить</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
