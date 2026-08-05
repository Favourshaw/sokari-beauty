<?php

declare(strict_types=1);

namespace App\Http\Controllers\Shop;

use App\Enums\PaymentMethod;
use App\Http\Controllers\Controller;
use App\Http\Requests\Shop\PlaceOrderRequest;
use App\Models\Order;
use App\Models\Setting;
use App\Models\ShippingMethod;
use App\Services\CartService;
use App\Services\CheckoutService;
use App\Services\CurrencyService;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly CartService $cart,
        private readonly CheckoutService $checkout,
        private readonly CurrencyService $currency,
        private readonly OrderService $orders,
    ) {
    }

    public function index(Request $request): Response|RedirectResponse
    {
        $detailed = $this->cart->detailed();
        if ($detailed['count'] === 0) {
            return redirect('/cart');
        }

        $methods = ShippingMethod::where('is_active', true)->orderBy('position')->get();
        $subtotal = $detailed['subtotal'];

        return Inertia::render('shop/checkout', [
            'cart' => $detailed,
            'shipping_methods' => $methods->map(fn (ShippingMethod $m) => [
                'id' => $m->id,
                'name' => $m->name,
                'description' => $m->description,
                'price' => $m->priceFor($subtotal),
                'price_formatted' => $this->currency->format($m->priceFor($subtotal)),
            ])->all(),
            'payment_methods' => $this->enabledPaymentMethods(),
            'addresses' => $request->user()?->addresses()->get() ?? [],
            'user' => $request->user()?->only(['name', 'email', 'phone']),
        ]);
    }

    public function quote(Request $request): JsonResponse
    {
        $data = $request->validate([
            'shipping_method_id' => ['nullable', 'integer', 'exists:shipping_methods,id'],
            'coupon_code' => ['nullable', 'string', 'max:50'],
        ]);

        $subtotal = $this->cart->existing()?->load('items')->subtotal() ?? 0;
        $quote = $this->checkout->quote($subtotal, $data['shipping_method_id'] ?? null, $data['coupon_code'] ?? null);

        return response()->json([
            'subtotal_formatted' => $this->currency->format($quote['subtotal']),
            'discount' => $quote['discount'],
            'discount_formatted' => '-'.$this->currency->format($quote['discount']),
            'shipping_formatted' => $quote['shipping'] === 0 ? 'Free' : $this->currency->format($quote['shipping']),
            'tax_formatted' => $this->currency->format($quote['tax']),
            'grand_total_formatted' => $this->currency->format($quote['grand_total']),
            'coupon_valid' => ! blank($data['coupon_code'] ?? null) ? $quote['coupon'] !== null : null,
        ]);
    }

    public function store(PlaceOrderRequest $request): RedirectResponse
    {
        try {
            $order = $this->checkout->place($request->user(), $request->toCheckoutData());
        } catch (RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        // Allow the (possibly guest) buyer to view their confirmation this session.
        session()->put('recent_order', $order->order_number);

        if ($order->payment_method === PaymentMethod::Stripe->value) {
            return redirect()->route('checkout.stripe', $order);
        }

        // Manual methods (COD / bank transfer): confirm now, admin verifies payment later.
        $this->orders->sendConfirmation($order);

        return redirect()->route('checkout.confirmation', $order->order_number);
    }

    public function confirmation(Order $order): Response
    {
        abort_unless($this->canView($order), 403);
        $order->load('items', 'shipment');

        return Inertia::render('shop/order-confirmation', [
            'order' => $this->presentOrder($order),
            'bank_details' => $order->payment_method === PaymentMethod::BankTransfer->value
                ? Setting::get('bank_details')
                : null,
        ]);
    }

    /**
     * @return array<int, array<string, string>>
     */
    private function enabledPaymentMethods(): array
    {
        $methods = [];
        if (Setting::get('payment_stripe_enabled') === '1') {
            $methods[] = ['value' => PaymentMethod::Stripe->value, 'label' => PaymentMethod::Stripe->label()];
        }
        if (Setting::get('payment_bank_transfer_enabled') === '1') {
            $methods[] = ['value' => PaymentMethod::BankTransfer->value, 'label' => PaymentMethod::BankTransfer->label()];
        }
        if (Setting::get('payment_cod_enabled') === '1') {
            $methods[] = ['value' => PaymentMethod::Cod->value, 'label' => PaymentMethod::Cod->label()];
        }

        return $methods;
    }

    private function canView(Order $order): bool
    {
        $user = request()->user();

        if ($user !== null && ($user->id === $order->user_id || $user->isStaff())) {
            return true;
        }

        return session()->get('recent_order') === $order->order_number;
    }

    /**
     * @return array<string, mixed>
     */
    private function presentOrder(Order $order): array
    {
        return [
            'order_number' => $order->order_number,
            'email' => $order->email,
            'status' => $order->status->value,
            'payment_method' => $order->payment_method,
            'subtotal_formatted' => $this->currency->format($order->subtotal),
            'discount_formatted' => $order->discount_total ? '-'.$this->currency->format($order->discount_total) : null,
            'shipping_formatted' => $order->shipping_total === 0 ? 'Free' : $this->currency->format($order->shipping_total),
            'tax_formatted' => $this->currency->format($order->tax_total),
            'grand_total_formatted' => $this->currency->format($order->grand_total),
            'items' => $order->items->map(fn ($item) => [
                'name' => $item->name,
                'variant' => $item->variant_name,
                'quantity' => $item->quantity,
                'line_total_formatted' => $this->currency->format($item->line_total),
            ])->all(),
        ];
    }
}
