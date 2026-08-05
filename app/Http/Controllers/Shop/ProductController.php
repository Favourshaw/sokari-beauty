<?php

declare(strict_types=1);

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductCardResource;
use App\Models\Product;
use App\Services\CurrencyService;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(private readonly CurrencyService $currency)
    {
    }

    public function show(Product $product): Response
    {
        abort_unless($product->status->value === 'active', 404);

        $product->load(['images', 'category', 'variants', 'tags', 'reviews' => fn ($q) => $q->approved()->latest()->limit(6)]);

        $related = Product::query()
            ->active()
            ->with(['images', 'category'])
            ->where('category_id', $product->category_id)
            ->whereKeyNot($product->id)
            ->limit(4)
            ->get();

        return Inertia::render('shop/product', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'brand' => $product->brand,
                'category' => $product->category?->name,
                'short_description' => $product->short_description,
                'description' => $product->description,
                'price' => $product->price,
                'price_formatted' => $this->currency->format($product->price),
                'compare_at_formatted' => $product->compare_at_price ? $this->currency->format($product->compare_at_price) : null,
                'on_sale' => $product->isOnSale(),
                'in_stock' => $product->inStock(),
                'stock_quantity' => $product->stock_quantity,
                'rating_avg' => (float) $product->rating_avg,
                'rating_count' => $product->rating_count,
                'images' => $product->images->map(fn ($image) => ['path' => $image->path, 'alt' => $image->alt])->all(),
                'variants' => $product->variants->map(fn ($variant) => [
                    'id' => $variant->id,
                    'name' => $variant->name,
                    'price_formatted' => $this->currency->format($variant->effectivePrice()),
                    'in_stock' => $variant->stock_quantity > 0,
                ])->all(),
                'tags' => $product->tags->pluck('name')->all(),
                'reviews' => $product->reviews->map(fn ($review) => [
                    'author' => $review->author_name ?? 'Verified Buyer',
                    'rating' => $review->rating,
                    'title' => $review->title,
                    'body' => $review->body,
                    'date' => $review->created_at?->format('M d, Y'),
                ])->all(),
            ],
            'related' => ProductCardResource::collection($related)->resolve(),
        ]);
    }
}
