<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class CartService
{
    public function __construct(private readonly CurrencyService $currency)
    {
    }

    /**
     * Resolve (or create) the cart for the current user or guest session.
     */
    public function current(): Cart
    {
        if (Auth::check()) {
            return Cart::firstOrCreate(['user_id' => Auth::id()]);
        }

        return Cart::firstOrCreate(['session_id' => Session::getId()]);
    }

    /**
     * Find the current cart without creating one (safe for read-only GETs).
     */
    public function existing(): ?Cart
    {
        if (Auth::check()) {
            return Cart::where('user_id', Auth::id())->first();
        }

        return Cart::where('session_id', Session::getId())->first();
    }

    /**
     * Add a product (optionally a variant) to the cart.
     */
    public function add(int $productId, ?int $variantId, int $quantity): void
    {
        $product = Product::query()->active()->findOrFail($productId);

        $unitPrice = $product->price;
        if ($variantId !== null) {
            $variant = ProductVariant::query()->where('product_id', $product->id)->findOrFail($variantId);
            $unitPrice = $variant->effectivePrice();
        }

        $cart = $this->current();

        $item = $cart->items()->firstOrNew([
            'product_id' => $product->id,
            'product_variant_id' => $variantId,
        ]);

        $item->quantity = ($item->exists ? $item->quantity : 0) + max(1, $quantity);
        $item->unit_price = $unitPrice;
        $item->save();
    }

    public function updateQuantity(int $itemId, int $quantity): void
    {
        $cart = $this->current();
        $item = $cart->items()->findOrFail($itemId);

        if ($quantity <= 0) {
            $item->delete();

            return;
        }

        $item->update(['quantity' => $quantity]);
    }

    public function remove(int $itemId): void
    {
        $this->current()->items()->whereKey($itemId)->delete();
    }

    public function clear(): void
    {
        $this->current()->items()->delete();
    }

    /**
     * When a guest logs in, fold their session cart into their user cart.
     */
    public function mergeGuestCart(int $userId): void
    {
        $guest = Cart::where('session_id', Session::getId())->with('items')->first();
        if ($guest === null) {
            return;
        }

        $userCart = Cart::firstOrCreate(['user_id' => $userId]);

        foreach ($guest->items as $item) {
            $existing = $userCart->items()->firstOrNew([
                'product_id' => $item->product_id,
                'product_variant_id' => $item->product_variant_id,
            ]);
            $existing->quantity = ($existing->exists ? $existing->quantity : 0) + $item->quantity;
            $existing->unit_price = $item->unit_price;
            $existing->save();
        }

        $guest->delete();
    }

    /**
     * Lightweight summary for the header badge / shared props.
     *
     * @return array{count: int, subtotal: int, subtotal_formatted: string}
     */
    public function summary(): array
    {
        $cart = $this->existing()?->load('items');

        $subtotal = $cart?->subtotal() ?? 0;

        return [
            'count' => $cart?->totalQuantity() ?? 0,
            'subtotal' => $subtotal,
            'subtotal_formatted' => $this->currency->format($subtotal),
        ];
    }

    /**
     * Full cart contents for the cart page.
     *
     * @return array<string, mixed>
     */
    public function detailed(): array
    {
        $cart = $this->existing()?->load(['items.product.images', 'items.variant']);

        if ($cart === null) {
            return ['items' => [], 'subtotal' => 0, 'subtotal_formatted' => $this->currency->format(0), 'count' => 0];
        }

        $items = $cart->items->map(function (CartItem $item): array {
            $product = $item->product;
            $image = $product?->images->firstWhere('is_primary', true) ?? $product?->images->first();

            return [
                'id' => $item->id,
                'name' => $product?->name,
                'slug' => $product?->slug,
                'variant' => $item->variant?->name,
                'image' => $image?->path,
                'unit_price_formatted' => $this->currency->format($item->unit_price),
                'quantity' => $item->quantity,
                'line_total_formatted' => $this->currency->format($item->lineTotal()),
                'url' => $product ? "/products/{$product->slug}" : '#',
            ];
        })->all();

        return [
            'items' => $items,
            'subtotal' => $cart->subtotal(),
            'subtotal_formatted' => Money::format($cart->subtotal()),
            'count' => $cart->totalQuantity(),
        ];
    }
}
