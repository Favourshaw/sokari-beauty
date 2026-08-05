<?php

declare(strict_types=1);

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductCardResource;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'q' => $request->string('q')->toString() ?: null,
            'category' => $request->string('category')->toString() ?: null,
            'sort' => $request->string('sort')->toString() ?: 'newest',
        ];

        $products = Product::query()
            ->active()
            ->with(['images', 'category'])
            ->when($filters['q'], fn (Builder $q, string $term) => $q->search($term))
            ->when($filters['category'], function (Builder $q, string $slug): void {
                $q->whereHas('category', fn (Builder $c) => $c->where('slug', $slug));
            })
            ->when($filters['sort'], function (Builder $q, string $sort): void {
                match ($sort) {
                    'price_asc' => $q->orderBy('price'),
                    'price_desc' => $q->orderByDesc('price'),
                    'rating' => $q->orderByDesc('rating_avg'),
                    default => $q->latest('published_at'),
                };
            })
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Product $product) => (new ProductCardResource($product))->resolve());

        return Inertia::render('shop/shop', [
            'products' => $products,
            'categories' => Category::query()->where('is_active', true)->orderBy('position')->get(['name', 'slug']),
            'filters' => $filters,
        ]);
    }
}
