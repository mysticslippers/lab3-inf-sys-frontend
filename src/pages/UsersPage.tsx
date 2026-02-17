import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchUsers, updateUserRole, clearUsersError } from '../store/usersSlice';
import type { UserDTO, UserRole } from '../types/user';
import { toast } from 'react-toastify';

const roleLabel: Record<UserRole, string> = {
    USER: 'Пользователь',
    ADMIN: 'Администратор',
};

const UsersPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const auth = useSelector((state: RootState) => state.auth);
    const { items, status, changingId, error } = useSelector(
        (state: RootState) => state.users
    );

    const isAdmin = auth.role === 'ADMIN';

    useEffect(() => {
        if (isAdmin && status === 'idle') {
            dispatch(fetchUsers());
        }
    }, [dispatch, isAdmin, status]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearUsersError());
        }
    }, [error, dispatch]);

    const handleRoleChange = (user: UserDTO, role: UserRole) => {
        if (role === user.role) return;
        dispatch(updateUserRole({ id: user.id, role }))
            .unwrap()
            .then((updated) => {
                toast.success(`Роль пользователя "${updated.username}" обновлена на ${roleLabel[updated.role]}`);
            })
            .catch(() => {
            });
    };

    if (!isAdmin) {
        return (
            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Пользователи</h2>
                <div className="rounded-xl border border-amber-500/60 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                    Доступ к управлению пользователями есть только у администратора.
                    Войдите под пользователем с ролью <b>ADMIN</b>.
                </div>
            </section>
        );
    }

    const isLoading = status === 'loading' && items.length === 0;

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">Пользователи</h2>
                <button
                    onClick={() => dispatch(fetchUsers())}
                    disabled={status === 'loading'}
                    className="rounded-xl bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700 disabled:opacity-60"
                >
                    {status === 'loading' ? 'Обновляем...' : 'Обновить'}
                </button>
            </div>

            <p className="text-sm text-slate-400">
                Здесь отображаются все пользователи системы. Администратор может
                менять роли между <b>USER</b> и <b>ADMIN</b>.
            </p>

            {isLoading ? (
                <div className="flex items-center justify-center py-12 text-sm text-slate-300">
                    Загрузка пользователей...
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
                    <table className="min-w-full text-xs sm:text-sm">
                        <thead className="bg-slate-950/60">
                        <tr className="text-slate-300">
                            <th className="px-3 py-2 text-left font-medium">ID</th>
                            <th className="px-3 py-2 text-left font-medium">
                                Имя пользователя
                            </th>
                            <th className="px-3 py-2 text-left font-medium">Роль</th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.map((u) => (
                            <tr
                                key={u.id}
                                className="border-t border-slate-800 hover:bg-slate-800/50"
                            >
                                <td className="px-3 py-2 align-middle">{u.id}</td>
                                <td className="px-3 py-2 align-middle">
                                    {u.username}
                                </td>
                                <td className="px-3 py-2 align-middle">
                                    <select
                                        value={u.role}
                                        onChange={(e) =>
                                            handleRoleChange(
                                                u,
                                                e.target.value as UserRole
                                            )
                                        }
                                        disabled={changingId === u.id}
                                        className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs outline-none focus:border-emerald-500 disabled:opacity-60"
                                    >
                                        <option value="USER">
                                            Пользователь (USER)
                                        </option>
                                        <option value="ADMIN">
                                            Администратор (ADMIN)
                                        </option>
                                    </select>
                                </td>
                            </tr>
                        ))}

                        {items.length === 0 && status === 'succeeded' && (
                            <tr>
                                <td
                                    colSpan={3}
                                    className="px-3 py-6 text-center text-slate-400"
                                >
                                    Пользователи не найдены
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
};

export default UsersPage;
