<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShippingMethod extends Model
{
    /** @use HasFactory<\Database\Factories\ShippingMethodFactory> */
    use HasFactory;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'free_over' => 'integer',
            'countries' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Effective price in pence given a cart subtotal (free over threshold).
     */
    public function priceFor(int $subtotal): int
    {
        if ($this->free_over !== null && $subtotal >= $this->free_over) {
            return 0;
        }

        return $this->price;
    }
}
