<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Currency;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Session;

class CurrencyService
{
    private const SESSION_KEY = 'currency_code';

    /**
     * All active currencies (cached).
     *
     * @return Collection<int, Currency>
     */
    public function active(): Collection
    {
        return Cache::remember('currencies.active', 3600, fn () => Currency::where('is_active', true)->orderBy('position')->get());
    }

    public function default(): Currency
    {
        return $this->active()->firstWhere('is_default', true)
            ?? $this->active()->first()
            ?? new Currency(['code' => 'GBP', 'symbol' => '£', 'name' => 'British Pound', 'rate_to_base' => 1]);
    }

    /**
     * The currency currently selected by the visitor.
     */
    public function current(): Currency
    {
        $code = Session::get(self::SESSION_KEY);

        return $this->active()->firstWhere('code', $code) ?? $this->default();
    }

    public function setCurrent(string $code): void
    {
        if ($this->active()->contains('code', $code)) {
            Session::put(self::SESSION_KEY, $code);
        }
    }

    /**
     * Format a base-currency (GBP pence) amount in the given (or current) currency.
     */
    public function format(int $basePence, ?Currency $currency = null): string
    {
        $currency ??= $this->current();
        $value = ($basePence / 100) * $currency->rate_to_base;
        $decimals = $currency->code === 'NGN' ? 0 : 2;

        return $currency->symbol.number_format($value, $decimals);
    }

    /**
     * Convert a base-currency (GBP pence) amount into the target currency's
     * minor units — used when charging via Stripe (GBP/USD/EUR only).
     */
    public function toMinorUnits(int $basePence, Currency $currency): int
    {
        return (int) round($basePence * $currency->rate_to_base);
    }

    /**
     * Whether Stripe can charge in the given currency (NGN is display-only).
     */
    public function stripeSupports(Currency $currency): bool
    {
        return in_array($currency->code, ['GBP', 'USD', 'EUR'], true);
    }

    public static function flushCache(): void
    {
        Cache::forget('currencies.active');
    }
}
