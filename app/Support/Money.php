<?php

declare(strict_types=1);

namespace App\Support;

/**
 * Minimal money helper. Values are integer minor units (pence) in the base
 * currency (GBP). Multi-currency conversion is layered on in CurrencyService.
 */
final class Money
{
    public static function format(int $pence, string $symbol = '£'): string
    {
        return $symbol.number_format($pence / 100, 2);
    }

    /**
     * Convert a decimal major-unit amount (e.g. pounds) into integer pence.
     */
    public static function toPence(int|float|string|null $amount): int
    {
        return (int) round(((float) $amount) * 100);
    }

    /**
     * Convert integer pence into a plain decimal string for form inputs.
     */
    public static function toDecimal(?int $pence): string
    {
        return number_format(($pence ?? 0) / 100, 2, '.', '');
    }
}
