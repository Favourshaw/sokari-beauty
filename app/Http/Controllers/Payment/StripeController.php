<?php

declare(strict_types=1);

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use App\Services\StripeService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Throwable;

class StripeController extends Controller
{
    public function __construct(
        private readonly StripeService $stripe,
        private readonly OrderService $orders,
    ) {
    }

    /**
     * Redirect the buyer to Stripe's hosted checkout for the given order.
     */
    public function checkout(Order $order): RedirectResponse|\Symfony\Component\HttpFoundation\Response
    {
        // Without API keys, fall back gracefully to a manual confirmation.
        if (! $this->stripe->isConfigured()) {
            $this->orders->sendConfirmation($order);

            return redirect()
                ->route('checkout.confirmation', $order->order_number)
                ->with('error', 'Card payments are not configured yet — your order was placed as pending.');
        }

        try {
            $url = $this->stripe->createCheckoutSession($order);
        } catch (Throwable $e) {
            report($e);

            return redirect()
                ->route('checkout.confirmation', $order->order_number)
                ->with('error', 'We could not start the card payment. Please contact us to complete your order.');
        }

        // Full-page redirect out to Stripe (works from an Inertia visit).
        return Inertia::location($url);
    }
}
