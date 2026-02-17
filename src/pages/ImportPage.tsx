import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchRoutesPage } from '../store/routesSlice';
import { fetchLocations } from '../store/locationsSlice';
import { fetchCoordinates } from '../store/coordinatesSlice';

import ImportHistoryTable from '../components/import/ImportHistoryTable';
import ImportUploadModal from '../components/import/ImportUploadModal';
import Spinner from '../components/common/Spinner';
import { toast } from 'react-toastify';

import {
    fetchMyImports,
    fetchAllImports,
    setScope,
    prependOperation,
    type ImportsScope,
} from '../store/importsSlice';
import type { ImportOperationDTO } from '../types/import';

const ImportPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const importsState = useSelector((state: RootState) => state.imports);
    const auth = useSelector((state: RootState) => state.auth);

    const { items, status, error, scope } = importsState;
    const isAuthenticated = auth.status === 'authenticated';

    const [uploadModalOpen, setUploadModalOpen] = useState(false);

    useEffect(() => {
        if (isAuthenticated && status === 'idle') {
            dispatch(fetchMyImports());
        }
    }, [dispatch, isAuthenticated, status]);

    const handleRefresh = () => {
        if (!isAuthenticated) {
            toast.error('Сначала войдите в систему');
            return;
        }

        if (scope === 'my') {
            dispatch(fetchMyImports());
        } else {
            dispatch(fetchAllImports());
        }
    };

    const changeScope = (nextScope: ImportsScope) => {
        if (!isAuthenticated) {
            toast.error('Сначала войдите в систему');
            return;
        }

        if (nextScope === scope) return;
        dispatch(setScope(nextScope));
        if (nextScope === 'my') {
            dispatch(fetchMyImports());
        } else {
            dispatch(fetchAllImports());
        }
    };

    const handleUploaded = (op: ImportOperationDTO) => {
        dispatch(prependOperation(op));

        dispatch(fetchRoutesPage());
        dispatch(fetchLocations());
        dispatch(fetchCoordinates());
        toast.success('Импорт запущен');
    };

    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">Импорт данных</h2>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center rounded-xl border border-slate-700 bg-slate-900/50 p-1 text-xs">
                        <button
                            className={[
                                'rounded-lg px-3 py-1',
                                scope === 'my'
                                    ? 'bg-slate-700 text-white'
                                    : 'text-slate-300 hover:text-white',
                            ].join(' ')}
                            onClick={() => changeScope('my')}
                        >
                            Мои операции
                        </button>
                        <button
                            className={[
                                'rounded-lg px-3 py-1',
                                scope === 'all'
                                    ? 'bg-slate-700 text-white'
                                    : 'text-slate-300 hover:text-white',
                            ].join(' ')}
                            onClick={() => changeScope('all')}
                        >
                            Все операции
                        </button>
                    </div>

                    <button
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
                        onClick={() => setUploadModalOpen(true)}
                        disabled={!isAuthenticated}
                    >
                        Импортировать JSON
                    </button>
                    <button
                        className="rounded-xl bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700 disabled:opacity-60"
                        onClick={handleRefresh}
                        disabled={!isAuthenticated || status === 'loading'}
                    >
                        {status === 'loading' ? 'Обновляем...' : 'Обновить'}
                    </button>
                </div>
            </div>

            {!isAuthenticated && (
                <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
                    Импорт и просмотр истории доступны только авторизованным
                    пользователям. Нажмите кнопку «Войти» в шапке и введите
                    логин/пароль.
                </div>
            )}

            {error && (
                <div className="rounded-lg border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                    {error}
                </div>
            )}

            {isAuthenticated ? (
                status === 'loading' && items.length === 0 ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="flex flex-col items-center gap-3 text-slate-300">
                            <Spinner />
                            <span className="text-sm">
                                Загружаем историю импорта...
                            </span>
                        </div>
                    </div>
                ) : (
                    <ImportHistoryTable items={items} />
                )
            ) : (
                <div className="py-8 text-sm text-slate-500">
                    История операций появится после входа в систему.
                </div>
            )}

            <ImportUploadModal
                open={uploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                onUploaded={handleUploaded}
            />
        </section>
    );
};

export default ImportPage;
