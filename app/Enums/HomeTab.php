<?php

declare(strict_types=1);

namespace App\Enums;

enum HomeTab: string
{
    case Hot = 'hot';
    case New = 'new';
    case Best = 'best';

    public function label(): string
    {
        return match ($this) {
            self::Hot => "What's Hot",
            self::New => 'New Arrivals',
            self::Best => 'Best Seller',
        };
    }
}
