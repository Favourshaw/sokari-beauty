<?php

declare(strict_types=1);

namespace App\Enums;

enum PaymentMethod: string
{
    case Stripe = 'stripe';
    case BankTransfer = 'bank_transfer';
    case Cod = 'cod';

    public function label(): string
    {
        return match ($this) {
            self::Stripe => 'Card (Stripe)',
            self::BankTransfer => 'Bank Transfer',
            self::Cod => 'Cash on Delivery',
        };
    }
}
