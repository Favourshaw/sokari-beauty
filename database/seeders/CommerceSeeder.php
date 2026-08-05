<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Coupon;
use App\Models\Currency;
use App\Models\Setting;
use App\Models\ShippingMethod;
use Illuminate\Database\Seeder;

class CommerceSeeder extends Seeder
{
    public function run(): void
    {
        $currencies = [
            ['code' => 'GBP', 'symbol' => '£', 'name' => 'British Pound', 'rate_to_base' => 1, 'is_default' => true, 'position' => 0],
            ['code' => 'USD', 'symbol' => '$', 'name' => 'US Dollar', 'rate_to_base' => 1.27, 'is_default' => false, 'position' => 1],
            ['code' => 'EUR', 'symbol' => '€', 'name' => 'Euro', 'rate_to_base' => 1.17, 'is_default' => false, 'position' => 2],
            ['code' => 'NGN', 'symbol' => '₦', 'name' => 'Nigerian Naira', 'rate_to_base' => 2000, 'is_default' => false, 'position' => 3],
        ];
        foreach ($currencies as $currency) {
            Currency::updateOrCreate(['code' => $currency['code']], $currency + ['is_active' => true]);
        }

        ShippingMethod::updateOrCreate(['name' => 'Standard Delivery'], [
            'description' => '3–5 working days. Free on orders over £50.',
            'price' => 395,
            'free_over' => 5000,
            'is_active' => true,
            'position' => 0,
        ]);
        ShippingMethod::updateOrCreate(['name' => 'Express Delivery'], [
            'description' => '1–2 working days.',
            'price' => 795,
            'free_over' => null,
            'is_active' => true,
            'position' => 1,
        ]);

        $settings = [
            'store_name' => 'Sokari Beauty',
            'store_email' => 'hello@sokaribeauty.com',
            'store_phone' => '+44 20 1234 5678',
            'vat_rate' => '20', // percent, VAT-inclusive pricing
            'base_currency' => 'GBP',
            'payment_stripe_enabled' => '1',
            'payment_cod_enabled' => '1',
            'payment_bank_transfer_enabled' => '1',
            'bank_details' => "Sokari Beauty Ltd\nSort code: 00-00-00\nAccount: 12345678\nReference: your order number",
            'low_stock_threshold' => '5',
        ];
        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
        Setting::flushCache();

        Coupon::updateOrCreate(['code' => 'WELCOME10'], [
            'type' => 'percentage',
            'value' => 10,
            'min_subtotal' => 2000,
            'is_active' => true,
        ]);
    }
}
