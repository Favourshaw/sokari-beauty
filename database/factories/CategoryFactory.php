<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        $name = fake()->unique()->randomElement([
            'Skincare', 'Cleansers', 'Serums', 'Moisturisers', 'Masks',
            'Sun Care', 'Body Care', 'Makeup', 'Fragrance', 'Gift Sets',
        ]);

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1, 9999),
            'description' => fake()->sentence(),
            'is_active' => true,
            'position' => fake()->numberBetween(0, 20),
        ];
    }
}
