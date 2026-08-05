<?php

declare(strict_types=1);

use App\Models\Product;
use App\Models\ShippingMethod;
use App\Models\User;

use function Pest\Laravel\actingAs;

function shippingMethod(): ShippingMethod
{
    return ShippingMethod::create([
        'name' => 'Standard', 'price' => 395, 'free_over' => 5000, 'is_active' => true, 'position' => 0,
    ]);
}

$address = [
    'first_name' => 'Jane', 'last_name' => 'Doe', 'line1' => '1 High St',
    'city' => 'London', 'postcode' => 'E1 6AN', 'country' => 'GB',
];

it('places a cash-on-delivery order, creates items and decrements stock', function () use ($address) {
    $user = User::factory()->create();
    $product = Product::factory()->create(['price' => 4200, 'stock_quantity' => 10]);
    $method = shippingMethod();

    actingAs($user)->post('/cart/add', ['product_id' => $product->id, 'quantity' => 2]);

    $response = actingAs($user)->post('/checkout', [
        'email' => 'jane@example.com',
        'shipping_method_id' => $method->id,
        'payment_method' => 'cod',
        'shipping' => $address,
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('orders', ['email' => 'jane@example.com', 'user_id' => $user->id, 'payment_method' => 'cod']);
    $this->assertDatabaseHas('order_items', ['product_id' => $product->id, 'quantity' => 2, 'line_total' => 8400]);
    expect($product->fresh()->stock_quantity)->toBe(8);
    $this->assertDatabaseCount('cart_items', 0);
});

it('blocks checkout when stock is insufficient', function () use ($address) {
    $user = User::factory()->create();
    $product = Product::factory()->create(['stock_quantity' => 1]);
    $method = shippingMethod();

    actingAs($user)->post('/cart/add', ['product_id' => $product->id, 'quantity' => 1]);
    // Reduce stock behind the buyer's back.
    $product->update(['stock_quantity' => 0]);

    actingAs($user)->post('/checkout', [
        'email' => 'jane@example.com',
        'shipping_method_id' => $method->id,
        'payment_method' => 'cod',
        'shipping' => $address,
    ])->assertSessionHas('error');

    $this->assertDatabaseCount('orders', 0);
});
