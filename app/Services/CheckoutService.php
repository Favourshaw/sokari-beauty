<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\Order;
use App\Models\Product;
use App\Models\Setting;
use App\Models\ShippingMethod;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class CheckoutService
{
    public function __construct(
        private readonly CartService $cart,
        private readonly CurrencyService $currency,
    ) {
    }

    /**
     * Compute order totals (base GBP pence) for a shipping method + optional coupon.
     *
     * @return array{subtotal:int, discount:int, shipping:int, tax:int, grand_total:int, coupon:?Coupon}
     */
    public function quote(int $subtotal, ?int $shippingMethodId, ?string $couponCode): array
    {
        $coupon = null;
        $discount = 0;

        if (! blank($couponCode)) {
            $found = Coupon::where('code', $couponCode)->first();
            if ($found !== null && $found->isRedeemable($subtotal)) {
                $coupon = $found;
                $discount = $found->discountFor($subtotal);
            }
        }

        $shipping = 0;
        if ($shippingMethodId !== null) {
            $method = ShippingMethod::find($shippingMethodId);
            $shipping = $method?->priceFor($subtotal - $discount) ?? 0;
        }

        $taxable = $subtotal - $discount + $shipping;
        $vatRate = (int) Setting::get('vat_rate', '20');
        // Prices are VAT-inclusive (UK consumer): surface the included VAT portion.
        $tax = (int) round($taxable * $vatRate / (100 + $vatRate));

        return [
            'subtotal' => $subtotal,
            'discount' => $discount,
            'shipping' => $shipping,
            'tax' => $tax,
            'grand_total' => $taxable,
            'coupon' => $coupon,
        ];
    }

    /**
     * Place an order from the current cart. Runs in a transaction and
     * decrements stock with row locks to prevent overselling.
     *
     * @param  array<string, mixed>  $data
     */
    public function place(?User $user, array $data): Order
    {
        $cart = $this->cart->current()->load(['items.product', 'items.variant']);

        if ($cart->items->isEmpty()) {
            throw new RuntimeException('Your bag is empty.');
        }

        return DB::transaction(function () use ($cart, $user, $data): Order {
            $subtotal = $cart->subtotal();
            $method = ShippingMethod::findOrFail($data['shipping_method_id']);
            $quote = $this->quote($subtotal, $method->id, $data['coupon_code'] ?? null);
            $currency = $this->currency->current();

            $order = Order::create([
                'order_number' => $this->generateNumber(),
                'user_id' => $user?->id,
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'status' => OrderStatus::Pending,
                'payment_status' => PaymentStatus::Unpaid,
                'payment_method' => $data['payment_method'],
                'currency' => $currency->code,
                'exchange_rate' => $currency->rate_to_base,
                'subtotal' => $quote['subtotal'],
                'discount_total' => $quote['discount'],
                'shipping_total' => $quote['shipping'],
                'tax_total' => $quote['tax'],
                'grand_total' => $quote['grand_total'],
                'coupon_id' => $quote['coupon']?->id,
                'shipping_address' => $data['shipping_address'],
                'billing_address' => $data['billing_address'] ?? $data['shipping_address'],
                'shipping_method' => $method->name,
                'customer_note' => $data['customer_note'] ?? null,
                'placed_at' => now(),
            ]);

            foreach ($cart->items as $item) {
                $product = $item->product;

                if ($product !== null && $product->track_inventory) {
                    $locked = Product::whereKey($product->id)->lockForUpdate()->first();
                    if ($locked->stock_quantity < $item->quantity) {
                        throw new RuntimeException("Insufficient stock for {$product->name}.");
                    }
                    $locked->decrement('stock_quantity', $item->quantity);
                }

                $order->items()->create([
                    'product_id' => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                    'name' => $product?->name ?? 'Product',
                    'variant_name' => $item->variant?->name,
                    'sku' => $product?->sku,
                    'unit_price' => $item->unit_price,
                    'quantity' => $item->quantity,
                    'line_total' => $item->lineTotal(),
                ]);
            }

            $order->payments()->create([
                'provider' => $data['payment_method'],
                'amount' => $quote['grand_total'],
                'currency' => $currency->code,
                'status' => 'pending',
            ]);

            if ($quote['coupon'] !== null) {
                $quote['coupon']->increment('used_count');
                CouponUsage::create([
                    'coupon_id' => $quote['coupon']->id,
                    'user_id' => $user?->id,
                    'order_id' => $order->id,
                ]);
            }

            $order->statusHistory()->create([
                'status' => OrderStatus::Pending->value,
                'note' => 'Order placed',
                'user_id' => $user?->id,
            ]);

            $this->cart->clear();

            return $order;
        });
    }

    private function generateNumber(): string
    {
        do {
            $number = 'SOK-'.now()->format('Ymd').'-'.strtoupper(Str::random(5));
        } while (Order::where('order_number', $number)->exists());

        return $number;
    }
}
