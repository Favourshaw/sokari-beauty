<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        $subtotal = fake()->numberBetween(2000, 20000);

        return [
            'order_number' => 'SOK-'.now()->format('Ymd').'-'.strtoupper(Str::random(5)),
            'email' => fake()->safeEmail(),
            'status' => OrderStatus::Pending,
            'payment_status' => PaymentStatus::Unpaid,
            'payment_method' => 'cod',
            'currency' => 'GBP',
            'exchange_rate' => 1,
            'subtotal' => $subtotal,
            'discount_total' => 0,
            'shipping_total' => 395,
            'tax_total' => (int) round(($subtotal + 395) * 20 / 120),
            'grand_total' => $subtotal + 395,
            'shipping_address' => ['first_name' => 'Jane', 'last_name' => 'Doe', 'line1' => '1 High St', 'city' => 'London', 'postcode' => 'E1 6AN', 'country' => 'GB'],
            'shipping_method' => 'Standard',
            'placed_at' => now(),
        ];
    }

    public function paid(): static
    {
        return $this->state(fn () => ['payment_status' => PaymentStatus::Paid, 'payment_method' => 'stripe']);
    }
}
