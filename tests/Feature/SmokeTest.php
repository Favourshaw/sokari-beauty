<?php

declare(strict_types=1);

use App\Models\Product;
use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

it('renders storefront pages', function (string $url) {
    Product::factory()->has(\App\Models\ProductImage::factory(), 'images')->create(['slug' => 'demo-product', 'status' => 'active', 'published_at' => now()]);

    get($url)->assertOk();
})->with([
    '/',
    '/shop',
    '/products/demo-product',
    '/about',
    '/contact',
    '/blog',
    '/cart',
]);

it('renders customer account pages', function (string $url) {
    actingAs(User::factory()->create())->get($url)->assertOk();
})->with([
    '/account',
    '/account/orders',
    '/account/wishlist',
    '/account/profile',
    '/account/delivery',
]);

it('renders admin pages for a super admin', function (string $url) {
    Product::factory()->create();
    actingAs(User::factory()->superAdmin()->create())->get($url)->assertOk();
})->with([
    '/admin',
    '/admin/products',
    '/admin/products/create',
    '/admin/categories',
    '/admin/collections',
    '/admin/orders',
    '/admin/customers',
    '/admin/reviews',
    '/admin/blog',
    '/admin/blog/create',
    '/admin/faqs',
    '/admin/discounts',
    '/admin/shipping',
    '/admin/staff',
    '/admin/settings',
]);
