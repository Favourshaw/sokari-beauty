<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\User;
use App\Notifications\OrderPlacedNotification;
use App\Notifications\OrderShippedNotification;
use Illuminate\Support\Facades\Notification;

class OrderService
{
    /**
     * Mark an order paid (from a webhook or an admin confirming manual payment).
     */
    public function markPaid(Order $order, ?string $reference = null, ?User $actor = null): void
    {
        $order->update([
            'payment_status' => PaymentStatus::Paid,
            'status' => $order->status === OrderStatus::Pending ? OrderStatus::Processing : $order->status,
        ]);

        $payment = $order->payments()->latest()->first();
        $payment?->update(['status' => 'paid', 'reference' => $reference ?? $payment->reference]);

        $this->recordStatus($order, $order->status, 'Payment received', $actor);
    }

    public function updateStatus(Order $order, OrderStatus $status, ?string $note = null, ?User $actor = null): void
    {
        $order->update(['status' => $status]);
        $this->recordStatus($order, $status, $note, $actor);
    }

    /**
     * Attach fulfilment/tracking to an order and notify the customer.
     *
     * @param  array{tracking_number?:?string, carrier?:?string, tracking_url?:?string, note?:?string}  $data
     */
    public function fulfill(Order $order, array $data, ?User $actor = null): void
    {
        $order->shipment()->updateOrCreate([], [
            'tracking_number' => $data['tracking_number'] ?? null,
            'carrier' => $data['carrier'] ?? null,
            'tracking_url' => $data['tracking_url'] ?? null,
            'note' => $data['note'] ?? null,
            'status' => 'shipped',
            'shipped_at' => now(),
        ]);

        $order->update(['status' => OrderStatus::Shipped]);
        $this->recordStatus($order, OrderStatus::Shipped, 'Order shipped', $actor);

        $this->notifyCustomer($order, new OrderShippedNotification($order));
    }

    public function markDelivered(Order $order, ?User $actor = null): void
    {
        $order->shipment?->update(['status' => 'delivered', 'delivered_at' => now()]);
        $this->updateStatus($order, OrderStatus::Delivered, 'Order delivered', $actor);
    }

    /**
     * Record a refund and flag the order. (Stripe API refund is issued separately.)
     */
    public function refund(Order $order, int $amount, ?string $reason, ?User $actor = null, ?string $reference = null): void
    {
        $order->refunds()->create([
            'payment_id' => $order->payments()->latest()->first()?->id,
            'amount' => $amount,
            'reason' => $reason,
            'reference' => $reference,
            'created_by' => $actor?->id,
        ]);

        $order->update([
            'payment_status' => PaymentStatus::Refunded,
            'status' => OrderStatus::Refunded,
        ]);
        $this->recordStatus($order, OrderStatus::Refunded, $reason ?? 'Order refunded', $actor);
    }

    public function sendConfirmation(Order $order): void
    {
        $this->notifyCustomer($order, new OrderPlacedNotification($order));
    }

    private function recordStatus(Order $order, OrderStatus $status, ?string $note, ?User $actor): void
    {
        $order->statusHistory()->create([
            'status' => $status->value,
            'note' => $note,
            'user_id' => $actor?->id,
        ]);
    }

    private function notifyCustomer(Order $order, object $notification): void
    {
        Notification::route('mail', $order->email)->notify($notification);
    }
}
