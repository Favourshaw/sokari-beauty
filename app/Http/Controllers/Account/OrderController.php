<?php

declare(strict_types=1);

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use App\Models\Order;
use App\Services\CurrencyService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(private readonly CurrencyService $currency)
    {
    }

    public function index(Request $request): Response
    {
        $orders = $request->user()->orders()
            ->withCount('items')
            ->latest()
            ->paginate(10)
            ->through(fn (Order $order) => [
                'order_number' => $order->order_number,
                'status' => $order->status->value,
                'payment_status' => $order->payment_status->value,
                'items_count' => $order->items_count,
                'grand_total_formatted' => $this->format($order->grand_total, $order->currency),
                'placed_at' => $order->placed_at?->format('M d, Y'),
                'url' => "/account/orders/{$order->order_number}",
            ]);

        return Inertia::render('account/orders', ['orders' => $orders]);
    }

    public function show(Request $request, Order $order): Response
    {
        abort_unless($order->user_id === $request->user()->id, 403);

        $order->load(['items', 'shipment', 'statusHistory']);

        return Inertia::render('account/order-detail', [
            'order' => [
                'order_number' => $order->order_number,
                'status' => $order->status->value,
                'payment_status' => $order->payment_status->value,
                'payment_method' => $order->payment_method,
                'placed_at' => $order->placed_at?->format('M d, Y'),
                'subtotal_formatted' => $this->format($order->subtotal, $order->currency),
                'discount_formatted' => $order->discount_total ? '-'.$this->format($order->discount_total, $order->currency) : null,
                'shipping_formatted' => $order->shipping_total === 0 ? 'Free' : $this->format($order->shipping_total, $order->currency),
                'tax_formatted' => $this->format($order->tax_total, $order->currency),
                'grand_total_formatted' => $this->format($order->grand_total, $order->currency),
                'shipping_address' => $order->shipping_address,
                'shipping_method' => $order->shipping_method,
                'items' => $order->items->map(fn ($item) => [
                    'name' => $item->name,
                    'variant' => $item->variant_name,
                    'quantity' => $item->quantity,
                    'line_total_formatted' => $this->format($item->line_total, $order->currency),
                ])->all(),
                'tracking' => $order->shipment ? [
                    'number' => $order->shipment->tracking_number,
                    'carrier' => $order->shipment->carrier,
                    'url' => $order->shipment->tracking_url,
                    'status' => $order->shipment->status,
                    'shipped_at' => $order->shipment->shipped_at?->format('M d, Y'),
                    'delivered_at' => $order->shipment->delivered_at?->format('M d, Y'),
                ] : null,
                'timeline' => $order->statusHistory->map(fn ($h) => [
                    'status' => $h->status,
                    'note' => $h->note,
                    'at' => $h->created_at?->format('M d, Y H:i'),
                ])->all(),
            ],
        ]);
    }

    private function format(int $pence, string $currencyCode): string
    {
        $currency = Currency::where('code', $currencyCode)->first();

        return $this->currency->format($pence, $currency);
    }
}
