import React from 'react';

interface Props {
    page: number;
    size: number;
    totalPages: number;
    onChange: (newPage: number) => void;
}

const RoutesPagination: React.FC<Props> = ({
                                               page,
                                               totalPages,
                                               onChange,
                                           }) => {
    if (totalPages <= 1) return null;

    const prevDisabled = page <= 0;
    const nextDisabled = page >= totalPages - 1;

    return (
        <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-slate-400">
                Страница {page + 1} из {totalPages}
            </div>
            <div className="flex gap-2">
                <button
                    className="rounded-lg border border-slate-700 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => onChange(page - 1)}
                    disabled={prevDisabled}
                >
                    Назад
                </button>
                <button
                    className="rounded-lg border border-slate-700 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => onChange(page + 1)}
                    disabled={nextDisabled}
                >
                    Вперёд
                </button>
            </div>
        </div>
    );
};

export default RoutesPagination;
