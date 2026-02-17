import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from './store';
import { wsService } from './api/wsClient';

import RoutesPage from './pages/RoutesPage';
import LocationsPage from './pages/LocationsPage';
import CoordinatesPage from './pages/CoordinatesPage';
import SpecialOperationsPage from './pages/SpecialOperationsPage';
import ImportPage from './pages/ImportPage';
import UsersPage from './pages/UsersPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import {
    fetchRoutesPage,
    applyWebSocketEvent as applyRoutesWs,
} from './store/routesSlice';
import {
    fetchLocations,
    applyWebSocketEvent as applyLocationsWs,
} from './store/locationsSlice';
import {
    fetchCoordinates,
    applyWebSocketEvent as applyCoordinatesWs,
} from './store/coordinatesSlice';
import { logout } from './store/authSlice';
import LoginModal from './components/auth/LoginModal';

type Tab = 'routes' | 'locations' | 'coordinates' | 'special' | 'import' | 'users';

const App: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const auth = useSelector((state: RootState) => state.auth);

    const [activeTab, setActiveTab] = useState<Tab>('routes');
    const [loginModalOpen, setLoginModalOpen] = useState(false);

    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
    if (pathname.startsWith('/reset-password')) {
        return (
            <>
                <ResetPasswordPage />
                <ToastContainer
                    position="bottom-right"
                    theme="dark"
                    autoClose={2500}
                    pauseOnHover
                    closeOnClick
                    newestOnTop
                />
            </>
        );
    }

    useEffect(() => {
        wsService.connect();

        wsService.onRoutesEvent((event) => {
            dispatch(applyRoutesWs(event));
        });

        wsService.onLocationsEvent((event) => {
            dispatch(applyLocationsWs(event));
        });

        wsService.onCoordinatesEvent((event) => {
            dispatch(applyCoordinatesWs(event));
        });

        dispatch(fetchRoutesPage());
        dispatch(fetchLocations());
        dispatch(fetchCoordinates());
    }, [dispatch]);

    const tabButtonClass = (tab: Tab) =>
        [
            'px-3 py-2 text-sm rounded-lg transition-colors',
            activeTab === tab
                ? 'bg-emerald-600/80 text-white'
                : 'text-slate-300 hover:text-emerald-400 hover:bg-slate-800/60',
        ].join(' ');

    const handleLogout = () => {
        dispatch(logout());
    };

    const isAdmin = auth.role === 'ADMIN';

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100">
            <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 gap-4">
                    <h1 className="text-xl font-semibold tracking-tight">
                        Route Manager
                    </h1>

                    <nav className="flex flex-1 justify-center gap-2 text-sm">
                        <button
                            className={tabButtonClass('routes')}
                            onClick={() => setActiveTab('routes')}
                        >
                            Маршруты
                        </button>
                        <button
                            className={tabButtonClass('locations')}
                            onClick={() => setActiveTab('locations')}
                        >
                            Локации
                        </button>
                        <button
                            className={tabButtonClass('coordinates')}
                            onClick={() => setActiveTab('coordinates')}
                        >
                            Координаты
                        </button>
                        <button
                            className={tabButtonClass('special')}
                            onClick={() => setActiveTab('special')}
                        >
                            Спец. операции
                        </button>
                        <button
                            className={tabButtonClass('import')}
                            onClick={() => setActiveTab('import')}
                        >
                            Импорт
                        </button>
                        {isAdmin && (
                            <button
                                className={tabButtonClass('users')}
                                onClick={() => setActiveTab('users')}
                            >
                                Пользователи
                            </button>
                        )}
                    </nav>

                    <div className="flex items-center gap-2">
                        {auth.status === 'authenticated' && auth.username ? (
                            <>
                                <span className="text-sm text-slate-300">
                                    👤 {auth.username}
                                    {auth.role === 'ADMIN' && (
                                        <span className="ml-1 text-xs text-emerald-400">
                                            (ADMIN)
                                        </span>
                                    )}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="rounded-xl border border-slate-600 px-3 py-1 text-xs hover:bg-slate-800"
                                >
                                    Выйти
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setLoginModalOpen(true)}
                                className="rounded-xl bg-slate-800 px-3 py-1 text-xs hover:bg-slate-700"
                            >
                                Войти
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-6">
                {activeTab === 'routes' && <RoutesPage />}
                {activeTab === 'locations' && <LocationsPage />}
                {activeTab === 'coordinates' && <CoordinatesPage />}
                {activeTab === 'special' && <SpecialOperationsPage />}
                {activeTab === 'import' && <ImportPage />}
                {activeTab === 'users' && <UsersPage />}
            </main>

            <LoginModal
                open={loginModalOpen}
                onClose={() => setLoginModalOpen(false)}
            />

            <ToastContainer
                position="bottom-right"
                theme="dark"
                autoClose={2500}
                pauseOnHover
                closeOnClick
                newestOnTop
            />
        </div>
    );
};

export default App;
