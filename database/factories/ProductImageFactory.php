<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductImage>
 */
class ProductImageFactory extends Factory
{
    protected $model = ProductImage::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'path' => '/images/product/product-'.fake()->numberBetween(1, 10).'.jpg',
            'alt' => fake()->words(2, true),
            'position' => 0,
            'is_primary' => true,
        ];
    }
}
