<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DiscountController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/discounts', [
            'coupons' => Coupon::latest()->get()->map(fn (Coupon $c) => [
                'id' => $c->id,
                'code' => $c->code,
                'type' => $c->type,
                'value' => $c->type === 'percentage' ? $c->value : Money::toDecimal($c->value),
                'value_label' => $c->type === 'percentage' ? "{$c->value}%" : Money::format($c->value),
                'min_subtotal' => $c->min_subtotal ? Money::toDecimal($c->min_subtotal) : '',
                'usage_limit' => $c->usage_limit,
                'used_count' => $c->used_count,
                'is_active' => $c->is_active,
            ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Coupon::create($this->payload($request));

        return back()->with('success', 'Discount created.');
    }

    public function update(Request $request, Coupon $discount): RedirectResponse
    {
        $discount->update($this->payload($request, $discount->id));

        return back()->with('success', 'Discount updated.');
    }

    public function destroy(Coupon $discount): RedirectResponse
    {
        $discount->delete();

        return back()->with('success', 'Discount deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Request $request, ?int $id = null): array
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:50', Rule::unique('coupons', 'code')->ignore($id)],
            'type' => ['required', Rule::in(['percentage', 'fixed'])],
            'value' => ['required', 'numeric', 'min:0'],
            'min_subtotal' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['boolean'],
        ]);

        return [
            'code' => strtoupper($data['code']),
            'type' => $data['type'],
            'value' => $data['type'] === 'percentage' ? (int) $data['value'] : Money::toPence($data['value']),
            'min_subtotal' => ! empty($data['min_subtotal']) ? Money::toPence($data['min_subtotal']) : null,
            'usage_limit' => $data['usage_limit'] ?? null,
            'is_active' => $request->boolean('is_active'),
        ];
    }
}
