<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    /** @use HasFactory<\Database\Factories\CartFactory> */
    use HasFactory;

    protected $fillable = ['user_id', 'session_id'];

    /**
     * @return HasMany<CartItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Total quantity of items in the cart.
     */
    public function totalQuantity(): int
    {
        return (int) $this->items->sum('quantity');
    }

    /**
     * Subtotal in pence.
     */
    public function subtotal(): int
    {
        return (int) $this->items->sum(fn (CartItem $item) => $item->unit_price * $item->quantity);
    }
}
