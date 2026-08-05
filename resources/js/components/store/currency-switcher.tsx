import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';

export function CurrencySwitcher() {
    const { currency } = usePage<SharedData>().props;

    if (!currency || currency.available.length <= 1) {
        return null;
    }

    function change(code: string) {
        router.post('/currency', { code }, { preserveScroll: true });
    }

    return (
        <select
            aria-label="Currency"
            value={currency.current.code}
            onChange={(e) => change(e.target.value)}
            className="hover:text-primary cursor-pointer bg-transparent text-sm outline-none"
        >
            {currency.available.map((option) => (
                <option key={option.code} value={option.code}>
                    {option.symbol} {option.code}
                </option>
            ))}
        </select>
    );
}
