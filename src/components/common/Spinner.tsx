import React from 'react';

interface Props {
    size?: 'sm' | 'md';
}

const Spinner: React.FC<Props> = ({ size = 'md' }) => {
    const dim = size === 'sm' ? 'h-4 w-4 border-2' : 'h-6 w-6 border-2';
    return (
        <span
            className={`inline-block ${dim} rounded-full border-slate-500 border-t-transparent animate-spin`}
        />
    );
};

export default Spinner;
