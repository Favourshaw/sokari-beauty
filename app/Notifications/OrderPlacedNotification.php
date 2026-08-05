<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Order;
use App\Support\Money;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderPlacedNotification extends Notification
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
        return (new MailMessage)
            ->subject("Your Sokari Beauty order {$this->order->order_number}")
            ->greeting('Thank you for your order!')
            ->line("Order {$this->order->order_number} has been received.")
            ->line('Total: '.Money::format($this->order->grand_total))
            ->line('We’ll email you again with tracking details once it ships.')
            ->salutation('With love, Sokari Beauty');
    }
}
