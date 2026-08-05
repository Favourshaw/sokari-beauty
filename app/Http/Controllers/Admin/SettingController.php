<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /** @var array<int, string> */
    private const KEYS = [
        'store_name', 'store_email', 'store_phone', 'vat_rate',
        'bank_details', 'low_stock_threshold',
        'payment_stripe_enabled', 'payment_cod_enabled', 'payment_bank_transfer_enabled',
    ];

    public function edit(): Response
    {
        return Inertia::render('admin/settings', [
            'settings' => collect(self::KEYS)->mapWithKeys(fn (string $key) => [$key => Setting::get($key)])->all(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'store_name' => ['required', 'string', 'max:120'],
            'store_email' => ['required', 'email'],
            'store_phone' => ['nullable', 'string', 'max:40'],
            'vat_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'bank_details' => ['nullable', 'string', 'max:1000'],
            'low_stock_threshold' => ['required', 'integer', 'min:0'],
            'payment_stripe_enabled' => ['boolean'],
            'payment_cod_enabled' => ['boolean'],
            'payment_bank_transfer_enabled' => ['boolean'],
        ]);

        foreach ($data as $key => $value) {
            Setting::put($key, is_bool($value) ? ($value ? '1' : '0') : (string) $value);
        }

        return back()->with('success', 'Settings saved.');
    }
}
