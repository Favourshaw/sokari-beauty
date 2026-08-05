<?php

declare(strict_types=1);

use App\Models\Order;
use App\Models\User;
use App\Notifications\OrderShippedNotification;
use Illuminate\Support\Facades\Notification;

use function Pest\Laravel\actingAs;

it('lets staff fulfil an order with tracking and notifies the customer', function () {
    Notification::fake();
    $staff = User::factory()->employee()->create();
    $order = Order::factory()->paid()->create();

    actingAs($staff)->post("/admin/orders/{$order->order_number}/fulfill", [
        'tracking_number' => 'TRK123456',
        'carrier' => 'Royal Mail',
        'tracking_url' => 'https://track.example.com/TRK123456',
    ])->assertRedirect();

    $this->assertDatabaseHas('order_shipments', [
        'order_id' => $order->id,
        'tracking_number' => 'TRK123456',
        'carrier' => 'Royal Mail',
        'status' => 'shipped',
    ]);
    expect($order->fresh()->status->value)->toBe('shipped');
    Notification::assertSentOnDemand(OrderShippedNotification::class);
});

it('lets staff update an order status and records history', function () {
    $staff = User::factory()->employee()->create();
    $order = Order::factory()->create();

    actingAs($staff)->post("/admin/orders/{$order->order_number}/status", [
        'status' => 'processing',
        'note' => 'Picking items',
    ])->assertRedirect();

    expect($order->fresh()->status->value)->toBe('processing');
    $this->assertDatabaseHas('order_status_history', ['order_id' => $order->id, 'status' => 'processing', 'note' => 'Picking items']);
});

it('forbids employees from issuing refunds', function () {
    $staff = User::factory()->employee()->create();
    $order = Order::factory()->paid()->create();

    actingAs($staff)->post("/admin/orders/{$order->order_number}/refund", ['amount' => '10.00'])->assertForbidden();
});

it('lets super admins record a refund', function () {
    $admin = User::factory()->superAdmin()->create();
    $order = Order::factory()->paid()->create(['payment_method' => 'cod']);

    actingAs($admin)->post("/admin/orders/{$order->order_number}/refund", ['amount' => '10.00', 'reason' => 'Damaged'])->assertRedirect();

    $this->assertDatabaseHas('refunds', ['order_id' => $order->id, 'amount' => 1000, 'reason' => 'Damaged']);
    expect($order->fresh()->payment_status->value)->toBe('refunded');
});
