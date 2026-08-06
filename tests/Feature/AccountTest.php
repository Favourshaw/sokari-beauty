<?php

declare(strict_types=1);

use App\Models\Product;
use App\Models\ShippingMethod;
use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

$delivery = [
    'first_name' => 'Jane',
    'last_name' => 'Doe',
    'line1' => '10 Rose Street',
    'city' => 'London',
    'postcode' => 'E1 6AN',
    'country' => 'GB',
    'phone' => '07123456789',
];

it('saves delivery details for the customer', function () use ($delivery) {
    $user = User::factory()->create();

    actingAs($user)->put('/account/delivery', $delivery)->assertRedirect();

    $this->assertDatabaseHas('addresses', [
        'user_id' => $user->id,
        'line1' => '10 Rose Street',
        'postcode' => 'E1 6AN',
        'is_default_shipping' => true,
    ]);
});

it('prefills the checkout shipping form from saved delivery details', function () use ($delivery) {
    $user = User::factory()->create();
    $product = Product::factory()->create(['stock_quantity' => 5]);
    ShippingMethod::create(['name' => 'Standard', 'price' => 395, 'is_active' => true, 'position' => 0]);

    actingAs($user)->put('/account/delivery', $delivery);
    actingAs($user)->post('/cart/add', ['product_id' => $product->id, 'quantity' => 1]);

    actingAs($user)->get('/checkout')->assertInertia(fn ($page) => $page
        ->component('shop/checkout')
        ->where('address.line1', '10 Rose Street')
        ->where('address.postcode', 'E1 6AN'));
});

it('updates the customer profile', function () {
    $user = User::factory()->create(['name' => 'Old Name']);

    actingAs($user)->patch('/account/profile', [
        'name' => 'New Name',
        'email' => $user->email,
        'phone' => '07999999999',
    ])->assertRedirect();

    expect($user->fresh()->name)->toBe('New Name')
        ->and($user->fresh()->phone)->toBe('07999999999');
});

it('redirects a logged-in customer dashboard to the account overview', function () {
    actingAs(User::factory()->create())->get('/dashboard')->assertRedirect('/account');
});
