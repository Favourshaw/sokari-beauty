<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderShippedNotification extends Notification
{
    use Queueable;

    public function __construct(public readonly Order $order)
    {
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $shipment = $this->order->shipment;

        $mail = (new MailMessage)
            ->subject("Your Sokari Beauty order {$this->order->order_number} has shipped")
            ->greeting('Good news — your order is on its way!')
            ->line("Order {$this->order->order_number} has been dispatched.");

        if ($shipment?->carrier) {
            $mail->line("Carrier: {$shipment->carrier}");
        }
        if ($shipment?->tracking_number) {
            $mail->line("Tracking number: {$shipment->tracking_number}");
        }
        if ($shipment?->tracking_url) {
            $mail->action('Track your parcel', $shipment->tracking_url);
        }

        return $mail->line('You can also track this order from your account.')
            ->salutation('With love, Sokari Beauty');
    }
}
