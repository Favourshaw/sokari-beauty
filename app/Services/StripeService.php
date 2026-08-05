<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Currency;
use App\Models\Order;
use Stripe\Checkout\Session;
use Stripe\Event;
use Stripe\Refund as StripeRefund;
use Stripe\StripeClient;
use Stripe\Webhook;

class StripeService
{
    public function __construct(private readonly CurrencyService $currency)
    {
    }

    public function isConfigured(): bool
    {
        return ! blank(config('services.stripe.secret'));
    }

    /**
     * Lazily build the Stripe client (never touched unless keys are present).
     */
    private function client(): StripeClient
    {
        return new StripeClient((string) config('services.stripe.secret'));
    }

    /**
     * Create a hosted Checkout Session for an order and return its redirect URL.
     */
    public function createCheckoutSession(Order $order): string
    {
        [$chargeCurrency, $amount] = $this->resolveCharge($order);

        $session = $this->client()->checkout->sessions->create([
            'mode' => 'payment',
            'customer_email' => $order->email,
            'line_items' => [[
                'quantity' => 1,
                'price_data' => [
                    'currency' => strtolower($chargeCurrency->code),
                    'unit_amount' => $amount,
                    'product_data' => [
                        'name' => "Sokari Beauty order {$order->order_number}",
                    ],
                ],
            ]],
            'metadata' => [
                'order_id' => (string) $order->id,
                'order_number' => $order->order_number,
            ],
            'success_url' => route('checkout.confirmation', $order->order_number),
            'cancel_url' => route('cart.index'),
        ]);

        $order->payments()->latest()->first()?->update(['reference' => $session->id]);

        return $session->url;
    }

    public function verifyWebhook(string $payload, string $signature): Event
    {
        return Webhook::constructEvent($payload, $signature, (string) config('services.stripe.webhook_secret'));
    }

    /**
     * Issue a refund against the order's Stripe payment intent.
     */
    public function refund(Order $order, int $baseAmountPence): ?string
    {
        $payment = $order->payments()->where('provider', 'stripe')->latest()->first();
        $intentId = $payment?->payload['payment_intent'] ?? null;

        if ($intentId === null) {
            return null;
        }

        [$chargeCurrency, $_] = $this->resolveCharge($order);
        $refund = $this->client()->refunds->create([
            'payment_intent' => $intentId,
            'amount' => $this->currency->toMinorUnits($baseAmountPence, $chargeCurrency),
        ]);

        return $refund->id;
    }

    /**
     * Determine the currency and minor-unit amount to charge. Stripe cannot
     * present NGN, so those orders fall back to GBP.
     *
     * @return array{0: Currency, 1: int}
     */
    private function resolveCharge(Order $order): array
    {
        $currency = Currency::where('code', $order->currency)->first()
            ?? new Currency(['code' => 'GBP', 'symbol' => '£', 'rate_to_base' => 1]);

        if (! $this->currency->stripeSupports($currency)) {
            $gbp = Currency::where('code', 'GBP')->first()
                ?? new Currency(['code' => 'GBP', 'symbol' => '£', 'rate_to_base' => 1]);

            return [$gbp, $order->grand_total];
        }

        return [$currency, $this->currency->toMinorUnits($order->grand_total, $currency)];
    }
}
