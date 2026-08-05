<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use App\Services\StripeService;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orders,
        private readonly StripeService $stripe,
    ) {
    }

    public function index(Request $request): Response
    {
        $orders = Order::query()
            ->withCount('items')
            ->when($request->string('status')->toString(), fn ($q, $s) => $q->where('status', $s))
            ->when($request->string('q')->toString(), fn ($q, $term) => $q->where(fn ($w) => $w->where('order_number', 'like', "%{$term}%")->orWhere('email', 'like', "%{$term}%")))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Order $o) => [
                'order_number' => $o->order_number,
                'email' => $o->email,
                'status' => $o->status->value,
                'payment_status' => $o->payment_status->value,
                'items_count' => $o->items_count,
                'total' => Money::format($o->grand_total),
                'placed_at' => $o->placed_at?->format('M d, Y H:i'),
                'url' => "/admin/orders/{$o->order_number}",
            ]);

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'filters' => ['q' => $request->string('q')->toString(), 'status' => $request->string('status')->toString()],
            'statuses' => OrderStatus::values(),
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load(['items', 'shipment', 'statusHistory.user', 'user', 'refunds']);

        return Inertia::render('admin/orders/show', [
            'order' => [
                'order_number' => $order->order_number,
                'email' => $order->email,
                'phone' => $order->phone,
                'status' => $order->status->value,
                'payment_status' => $order->payment_status->value,
                'payment_method' => $order->payment_method,
                'placed_at' => $order->placed_at?->format('M d, Y H:i'),
                'customer_note' => $order->customer_note,
                'subtotal' => Money::format($order->subtotal),
                'discount' => $order->discount_total ? Money::format($order->discount_total) : null,
                'shipping' => Money::format($order->shipping_total),
                'tax' => Money::format($order->tax_total),
                'grand_total' => Money::format($order->grand_total),
                'shipping_address' => $order->shipping_address,
                'shipping_method' => $order->shipping_method,
                'items' => $order->items->map(fn ($i) => [
                    'name' => $i->name,
                    'variant' => $i->variant_name,
                    'sku' => $i->sku,
                    'quantity' => $i->quantity,
                    'unit_price' => Money::format($i->unit_price),
                    'line_total' => Money::format($i->line_total),
                ]),
                'shipment' => $order->shipment ? [
                    'tracking_number' => $order->shipment->tracking_number,
                    'carrier' => $order->shipment->carrier,
                    'tracking_url' => $order->shipment->tracking_url,
                    'status' => $order->shipment->status,
                ] : null,
                'timeline' => $order->statusHistory->map(fn ($h) => [
                    'status' => $h->status,
                    'note' => $h->note,
                    'by' => $h->user?->name,
                    'at' => $h->created_at?->format('M d, Y H:i'),
                ]),
                'refunds' => $order->refunds->map(fn ($r) => ['amount' => Money::format($r->amount), 'reason' => $r->reason, 'at' => $r->created_at?->format('M d, Y')]),
            ],
            'statuses' => OrderStatus::values(),
            'can_refund' => request()->user()->isSuperAdmin(),
        ]);
    }

    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(OrderStatus::values())],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $this->orders->updateStatus($order, OrderStatus::from($data['status']), $data['note'] ?? null, $request->user());

        return back()->with('success', 'Order status updated.');
    }

    public function fulfill(Request $request, Order $order): RedirectResponse
    {
        $data = $request->validate([
            'tracking_number' => ['nullable', 'string', 'max:120'],
            'carrier' => ['nullable', 'string', 'max:80'],
            'tracking_url' => ['nullable', 'url', 'max:255'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $this->orders->fulfill($order, $data, $request->user());

        return back()->with('success', 'Order marked as shipped and the customer has been notified.');
    }

    public function markPaid(Request $request, Order $order): RedirectResponse
    {
        $this->orders->markPaid($order, null, $request->user());

        return back()->with('success', 'Order marked as paid.');
    }

    public function markDelivered(Request $request, Order $order): RedirectResponse
    {
        $this->orders->markDelivered($order, $request->user());

        return back()->with('success', 'Order marked as delivered.');
    }

    public function refund(Request $request, Order $order): RedirectResponse
    {
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $amount = Money::toPence($data['amount']);
        $reference = null;

        if ($order->payment_method === 'stripe' && $this->stripe->isConfigured()) {
            $reference = $this->stripe->refund($order, $amount);
        }

        $this->orders->refund($order, $amount, $data['reason'] ?? null, $request->user(), $reference);

        return back()->with('success', 'Refund recorded.');
    }
}
