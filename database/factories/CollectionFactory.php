<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Collection;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Collection>
 */
class CollectionFactory extends Factory
{
    protected $model = Collection::class;

    public function definition(): array
    {
        $title = fake()->unique()->words(2, true);

        return [
            'title' => Str::title($title),
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(1, 9999),
            'description' => fake()->sentence(),
            'is_active' => true,
            'is_featured' => false,
            'position' => fake()->numberBetween(0, 20),
        ];
    }
}
