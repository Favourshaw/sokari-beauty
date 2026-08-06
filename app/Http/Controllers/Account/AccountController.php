<?php

declare(strict_types=1);

namespace App\Http\Controllers\Account;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    /**
     * Account overview / customer dashboard.
     */
    public function overview(Request $request): Response
    {
        $user = $request->user();

        $totalSpent = (int) $user->orders()
            ->where('payment_status', PaymentStatus::Paid->value)
            ->sum('grand_total');

        return Inertia::render('account/overview', [
            'stats' => [
                'orders' => $user->orders()->count(),
                'total_spent' => Money::format($totalSpent),
                'wishlist' => $user->wishlistItems()->count(),
            ],
            'recent_orders' => $user->orders()->latest()->limit(4)->get()->map(fn (Order $o) => [
                'order_number' => $o->order_number,
                'status' => $o->status->value,
                'total' => Money::format($o->grand_total),
                'placed_at' => $o->placed_at?->format('M d, Y'),
                'url' => "/account/orders/{$o->order_number}",
            ]),
            'has_delivery' => $user->addresses()->where('is_default_shipping', true)->exists(),
            'profile' => $user->only(['name', 'email', 'phone']),
        ]);
    }

    public function profile(Request $request): Response
    {
        return Inertia::render('account/profile', [
            'profile' => $request->user()->only(['name', 'email', 'phone']),
            'status' => session('status'),
        ]);
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:40'],
        ]);

        if ($data['email'] !== $user->email) {
            $user->email_verified_at = null;
        }

        $user->fill($data)->save();

        return back()->with('success', 'Profile updated.');
    }

    public function delivery(Request $request): Response
    {
        $address = $request->user()->addresses()->where('is_default_shipping', true)->first();

        return Inertia::render('account/delivery', [
            'address' => $address?->only([
                'first_name', 'last_name', 'company', 'line1', 'line2',
                'city', 'county', 'postcode', 'country', 'phone',
            ]),
        ]);
    }

    public function updateDelivery(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:80'],
            'last_name' => ['required', 'string', 'max:80'],
            'company' => ['nullable', 'string', 'max:120'],
            'line1' => ['required', 'string', 'max:160'],
            'line2' => ['nullable', 'string', 'max:160'],
            'city' => ['required', 'string', 'max:80'],
            'county' => ['nullable', 'string', 'max:80'],
            'postcode' => ['required', 'string', 'max:20'],
            'country' => ['required', 'string', 'size:2'],
            'phone' => ['nullable', 'string', 'max:40'],
        ]);

        $request->user()->addresses()->updateOrCreate(
            ['is_default_shipping' => true],
            [...$data, 'label' => 'Delivery', 'is_default_shipping' => true, 'is_default_billing' => true],
        );

        return back()->with('success', 'Delivery details saved.');
    }
}
