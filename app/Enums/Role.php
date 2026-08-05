<?php

declare(strict_types=1);

namespace App\Enums;

enum Role: string
{
    case SuperAdmin = 'super_admin';
    case Employee = 'employee';
    case Customer = 'customer';

    /**
     * Human readable label for the role.
     */
    public function label(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Super Admin',
            self::Employee => 'Employee',
            self::Customer => 'Customer',
        };
    }

    /**
     * Roles that may access the admin area.
     *
     * @return array<int, self>
     */
    public static function staff(): array
    {
        return [self::SuperAdmin, self::Employee];
    }

    /**
     * Whether this role is considered store staff (admin area access).
     */
    public function isStaff(): bool
    {
        return in_array($this, self::staff(), true);
    }
}
