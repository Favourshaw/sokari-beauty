<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\HomeTab;
use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Collection;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $categories = collect([
            'Cleansers', 'Serums', 'Moisturisers', 'Masks', 'Sun Care', 'Body Care',
        ])->mapWithKeys(fn (string $name, int $i) => [
            $name => Category::create([
                'name' => $name,
                'slug' => Str::slug($name),
                'description' => "Shop our {$name} range.",
                'position' => $i,
                'is_active' => true,
            ]),
        ]);

        // Home-tab collections that drive the tabbed product grid.
        $hot = Collection::create(['title' => "What's Hot", 'home_tab' => HomeTab::Hot, 'is_featured' => true, 'position' => 0]);
        $new = Collection::create(['title' => 'New Arrivals', 'home_tab' => HomeTab::New, 'position' => 1]);
        $best = Collection::create(['title' => 'Best Seller', 'home_tab' => HomeTab::Best, 'position' => 2]);

        // Curated storefront collections.
        $mothersDay = Collection::create(['title' => "Mother's Day Edit", 'is_featured' => true, 'position' => 3, 'image' => '/images/section/box-1.jpg']);
        $essentials = Collection::create(['title' => 'Skincare Essentials', 'position' => 4, 'image' => '/images/section/box-2.jpg']);

        $products = [
            ['Dream Bio Retinol Serum', 'Serums', 5699, null, 1, ['hot', 'best'], true],
            ['Hydra Glow Moisturiser', 'Moisturisers', 4200, null, 2, ['hot', 'best'], true],
            ['Gentle Foaming Cleanser', 'Cleansers', 2450, null, 3, ['new'], false],
            ['Vitamin C Brightening Serum', 'Serums', 4800, 6000, 4, ['hot', 'best'], true],
            ['Overnight Repair Mask', 'Masks', 3800, null, 5, ['new', 'best'], false],
            ['Niacinamide Pore Refiner', 'Serums', 2999, null, 6, ['hot'], false],
            ['Daily Mineral SPF 50', 'Sun Care', 3200, null, 7, ['new'], true],
            ['Rose Quartz Body Butter', 'Body Care', 2600, null, 8, ['new'], false],
            ['Hyaluronic Acid Hydra Boost', 'Serums', 3450, 4500, 9, ['hot', 'best'], true],
            ['Calming Ceramide Cream', 'Moisturisers', 4000, null, 10, ['hot', 'best'], false],
            ['Purifying Clay Mask', 'Masks', 2200, null, 1, ['new'], false],
            ['Radiance Eye Serum', 'Serums', 4500, null, 2, ['new'], true],
        ];

        $tabMap = ['hot' => $hot, 'new' => $new, 'best' => $best];

        foreach ($products as $index => [$name, $categoryName, $price, $compareAt, $imageNo, $tabs, $featured]) {
            $product = Product::create([
                'name' => $name,
                'slug' => Str::slug($name),
                'sku' => 'SOK-'.str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT),
                'category_id' => $categories[$categoryName]->id,
                'brand' => 'Sokari',
                'short_description' => 'Five ingredients. Nothing more — targeted essentials that repair, renew and hydrate.',
                'description' => "<p>{$name} delivers real results with higher concentrations of effective ingredients — no cheap fillers, no irritation. Formulated for every skin type and cruelty-free.</p><p>Apply to clean skin morning and night for best results.</p>",
                'price' => $price,
                'compare_at_price' => $compareAt,
                'stock_quantity' => random_int(15, 120),
                'track_inventory' => true,
                'status' => ProductStatus::Active,
                'is_featured' => $featured,
                'rating_avg' => 4.5 + (random_int(0, 4) / 10),
                'rating_count' => random_int(12, 240),
                'published_at' => now(),
            ]);

            $product->images()->create([
                'path' => "/images/product/product-{$imageNo}.jpg",
                'alt' => $name,
                'position' => 0,
                'is_primary' => true,
            ]);

            foreach ($tabs as $tab) {
                $product->collections()->attach($tabMap[$tab]->id, ['position' => $index]);
            }

            // Sprinkle products across the curated collections.
            if ($featured) {
                $product->collections()->attach($mothersDay->id, ['position' => $index]);
            }
            if (in_array($categoryName, ['Cleansers', 'Serums', 'Moisturisers'], true)) {
                $product->collections()->attach($essentials->id, ['position' => $index]);
            }
        }
    }
}
