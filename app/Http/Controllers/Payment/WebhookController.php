<?php

declare(strict_types=1);

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use App\Services\StripeService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Throwable;

class WebhookController extends Controller
{
    public function __construct(
        private readonly StripeService $stripe,
        private readonly OrderService $orders,
    ) {
    }

    public function handle(Request $request): Response
    {
        try {
            $event = $this->stripe->verifyWebhook(
                $request->getContent(),
                (string) $request->header('Stripe-Signature'),
            );
        } catch (Throwable $e) {
            return response('Invalid signature', 400);
        }

        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;
            $orderId = $session->metadata->order_id ?? null;
            $order = $orderId ? Order::find($orderId) : null;

            if ($order !== null && $order->payment_status->value !== 'paid') {
                $order->payments()->where('provider', 'stripe')->latest()->first()?->update([
                    'payload' => ['payment_intent' => $session->payment_intent, 'session_id' => $session->id],
                ]);
                $this->orders->markPaid($order, $session->payment_intent);
                $this->orders->sendConfirmation($order);
            }
        }

        return response('ok', 200);
    }
}
