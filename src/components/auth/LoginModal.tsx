import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { login, clearAuthError } from '../../store/authSlice';
import Spinner from '../common/Spinner';
import { toast } from 'react-toastify';
import ForgotPasswordModal from './ForgotPasswordModal';

interface Props {
    open: boolean;
    onClose: () => void;
}

const LoginModal: React.FC<Props> = ({ open, onClose }) => {
    const dispatch = useDispatch<AppDispatch>();
    const auth = useSelector((state: RootState) => state.auth);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [forgotOpen, setForgotOpen] = useState(false);

    useEffect(() => {
        if (!open) {
            setUsername('');
            setPassword('');
            setForgotOpen(false);
            dispatch(clearAuthError());
        }
    }, [open, dispatch]);

    if (!open) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await dispatch(login({ username, password })).unwrap();
            toast.success('Вход выполнен');
            onClose();
        } catch {
        }
    };

    const handleClose = () => {
        if (auth.status === 'loading') return;
        onClose();
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                <div className="relative w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="absolute right-4 top-4 text-slate-500 hover:text-slate-300"
                    >
                        ✕
                    </button>

                    <h3 className="mb-4 text-lg font-semibold">Вход</h3>

                    {auth.error && (
                        <div className="mb-3 rounded-lg border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                            {auth.error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                        <div>
                            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                                Логин
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
                                autoComplete="username"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                                Пароль
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
                                autoComplete="current-password"
                                required
                            />

                            <div className="mt-2 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setForgotOpen(true)}
                                    className="text-xs text-slate-300 hover:text-emerald-400"
                                    disabled={auth.status === 'loading'}
                                >
                                    Забыли пароль?
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={auth.status === 'loading'}
                                className="rounded-xl border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800"
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                disabled={auth.status === 'loading'}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
                            >
                                {auth.status === 'loading' && <Spinner size="sm" />}
                                <span>Войти</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <ForgotPasswordModal
                open={forgotOpen}
                onClose={() => setForgotOpen(false)}
            />
        </>
    );
};

export default LoginModal;
