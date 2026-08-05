<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ShippingMethod;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShippingController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/shipping', [
            'methods' => ShippingMethod::orderBy('position')->get()->map(fn (ShippingMethod $m) => [
                'id' => $m->id,
                'name' => $m->name,
                'description' => $m->description,
                'price' => Money::toDecimal($m->price),
                'price_label' => Money::format($m->price),
                'free_over' => $m->free_over ? Money::toDecimal($m->free_over) : '',
                'is_active' => $m->is_active,
            ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        ShippingMethod::create($this->payload($request));

        return back()->with('success', 'Shipping method created.');
    }

    public function update(Request $request, ShippingMethod $shipping): RedirectResponse
    {
        $shipping->update($this->payload($request));

        return back()->with('success', 'Shipping method updated.');
    }

    public function destroy(ShippingMethod $shipping): RedirectResponse
    {
        $shipping->delete();

        return back()->with('success', 'Shipping method deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Request $request): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'free_over' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        return [
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'price' => Money::toPence($data['price']),
            'free_over' => ! empty($data['free_over']) ? Money::toPence($data['free_over']) : null,
            'is_active' => $request->boolean('is_active'),
        ];
    }
}
