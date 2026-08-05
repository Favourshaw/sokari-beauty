<?php

declare(strict_types=1);

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductCardResource;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    public function index(Request $request): Response
    {
        $products = $request->user()->wishlistItems()
            ->with('product.images', 'product.category')
            ->get()
            ->map(fn ($item) => $item->product)
            ->filter();

        return Inertia::render('account/wishlist', [
            'products' => ProductCardResource::collection($products)->resolve(),
        ]);
    }

    public function toggle(Request $request, Product $product): RedirectResponse
    {
        $existing = $request->user()->wishlistItems()->where('product_id', $product->id)->first();

        if ($existing !== null) {
            $existing->delete();

            return back()->with('success', 'Removed from wishlist.');
        }

        $request->user()->wishlistItems()->create(['product_id' => $product->id]);

        return back()->with('success', 'Saved to wishlist.');
    }
}
