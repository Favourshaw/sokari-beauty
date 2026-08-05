<?php

declare(strict_types=1);

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function __construct(private readonly CartService $cart)
    {
    }

    public function index(): Response
    {
        return Inertia::render('shop/cart', [
            'cart' => $this->cart->detailed(),
        ]);
    }

    public function add(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'product_variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
            'variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $variantId = $data['product_variant_id'] ?? $data['variant_id'] ?? null;
        $this->cart->add($data['product_id'], $variantId, $data['quantity']);

        return back()->with('success', 'Added to your bag.');
    }

    public function update(Request $request, int $item): RedirectResponse
    {
        $data = $request->validate([
            'quantity' => ['required', 'integer', 'min:0', 'max:99'],
        ]);

        $this->cart->updateQuantity($item, $data['quantity']);

        return back()->with('success', 'Bag updated.');
    }

    public function remove(int $item): RedirectResponse
    {
        $this->cart->remove($item);

        return back()->with('success', 'Item removed.');
    }
}
