<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    /** @use HasFactory<\Database\Factories\CouponFactory> */
    use HasFactory;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'value' => 'integer',
            'min_subtotal' => 'integer',
            'usage_limit' => 'integer',
            'used_count' => 'integer',
            'is_active' => 'boolean',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    /**
     * Whether the coupon can currently be redeemed against the given subtotal (pence).
     */
    public function isRedeemable(int $subtotal): bool
    {
        if (! $this->is_active) {
            return false;
        }
        if ($this->starts_at !== null && $this->starts_at->isFuture()) {
            return false;
        }
        if ($this->ends_at !== null && $this->ends_at->isPast()) {
            return false;
        }
        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) {
            return false;
        }
        if ($this->min_subtotal !== null && $subtotal < $this->min_subtotal) {
            return false;
        }

        return true;
    }

    /**
     * Discount amount in pence for a given subtotal.
     */
    public function discountFor(int $subtotal): int
    {
        $discount = $this->type === 'percentage'
            ? (int) round($subtotal * ($this->value / 100))
            : $this->value;

        return min($discount, $subtotal);
    }
}
