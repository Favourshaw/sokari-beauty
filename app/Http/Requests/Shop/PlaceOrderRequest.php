<?php

declare(strict_types=1);

namespace App\Http\Requests\Shop;

use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PlaceOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'phone' => ['nullable', 'string', 'max:40'],
            'shipping_method_id' => ['required', 'integer', 'exists:shipping_methods,id'],
            'payment_method' => ['required', Rule::in(array_map(fn (PaymentMethod $m) => $m->value, PaymentMethod::cases()))],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'customer_note' => ['nullable', 'string', 'max:1000'],

            'shipping.first_name' => ['required', 'string', 'max:80'],
            'shipping.last_name' => ['required', 'string', 'max:80'],
            'shipping.company' => ['nullable', 'string', 'max:120'],
            'shipping.line1' => ['required', 'string', 'max:160'],
            'shipping.line2' => ['nullable', 'string', 'max:160'],
            'shipping.city' => ['required', 'string', 'max:80'],
            'shipping.county' => ['nullable', 'string', 'max:80'],
            'shipping.postcode' => ['required', 'string', 'max:20'],
            'shipping.country' => ['required', 'string', 'size:2'],
            'shipping.phone' => ['nullable', 'string', 'max:40'],
        ];
    }

    /**
     * Normalised payload for CheckoutService::place().
     *
     * @return array<string, mixed>
     */
    public function toCheckoutData(): array
    {
        $shipping = $this->validated('shipping');

        return [
            'email' => $this->validated('email'),
            'phone' => $this->validated('phone'),
            'shipping_method_id' => $this->validated('shipping_method_id'),
            'payment_method' => $this->validated('payment_method'),
            'coupon_code' => $this->validated('coupon_code'),
            'customer_note' => $this->validated('customer_note'),
            'shipping_address' => $shipping,
            'billing_address' => $shipping,
        ];
    }
}
