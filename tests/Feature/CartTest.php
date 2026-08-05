<?php

declare(strict_types=1);

use App\Models\Product;
use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\post;

it('adds a product to the cart and reflects it in the summary', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create(['price' => 5699]);

    actingAs($user)
        ->post('/cart/add', ['product_id' => $product->id, 'quantity' => 2])
        ->assertRedirect();

    $this->assertDatabaseHas('cart_items', [
        'product_id' => $product->id,
        'quantity' => 2,
        'unit_price' => 5699,
    ]);
});

it('increments quantity when the same product is added again', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create();

    actingAs($user)->post('/cart/add', ['product_id' => $product->id, 'quantity' => 1]);
    actingAs($user)->post('/cart/add', ['product_id' => $product->id, 'quantity' => 3]);

    $this->assertDatabaseHas('cart_items', [
        'product_id' => $product->id,
        'quantity' => 4,
    ]);
});

it('rejects adding a product with an invalid quantity', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create();

    actingAs($user)
        ->post('/cart/add', ['product_id' => $product->id, 'quantity' => 0])
        ->assertSessionHasErrors('quantity');
});
