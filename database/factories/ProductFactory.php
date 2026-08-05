<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $name = Str::title(fake()->unique()->words(2, true));
        $price = fake()->numberBetween(900, 9900); // pence

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1, 99999),
            'sku' => strtoupper(Str::random(8)),
            'category_id' => Category::factory(),
            'brand' => 'Sokari',
            'short_description' => fake()->sentence(),
            'description' => fake()->paragraphs(2, true),
            'price' => $price,
            'compare_at_price' => fake()->boolean(30) ? $price + fake()->numberBetween(500, 2000) : null,
            'stock_quantity' => fake()->numberBetween(0, 120),
            'track_inventory' => true,
            'status' => ProductStatus::Active,
            'is_featured' => fake()->boolean(20),
            'published_at' => now(),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn () => ['status' => ProductStatus::Draft, 'published_at' => null]);
    }

    public function outOfStock(): static
    {
        return $this->state(fn () => ['stock_quantity' => 0]);
    }
}
