<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\PaymentStatus;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use App\Support\Money;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $paid = Order::where('payment_status', PaymentStatus::Paid->value);
        $revenue = (int) (clone $paid)->sum('grand_total');
        $orderCount = Order::count();
        $lowStock = (int) Setting::get('low_stock_threshold', '5');

        $revenueByDay = collect(range(6, 0))->map(function (int $daysAgo) {
            $date = Carbon::today()->subDays($daysAgo);
            $total = (int) Order::where('payment_status', PaymentStatus::Paid->value)
                ->whereDate('placed_at', $date)
                ->sum('grand_total');

            return ['label' => $date->format('D'), 'total' => $total, 'formatted' => Money::format($total)];
        })->values();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'revenue' => Money::format($revenue),
                'orders' => $orderCount,
                'customers' => User::where('role', Role::Customer->value)->count(),
                'aov' => Money::format($orderCount > 0 ? (int) round($revenue / max(1, (int) (clone $paid)->count())) : 0),
                'pending_orders' => Order::where('status', 'pending')->count(),
                'low_stock' => Product::where('track_inventory', true)->where('stock_quantity', '<=', $lowStock)->count(),
            ],
            'revenue_by_day' => $revenueByDay,
            'recent_orders' => Order::latest()->limit(8)->get()->map(fn (Order $o) => [
                'order_number' => $o->order_number,
                'email' => $o->email,
                'status' => $o->status->value,
                'total' => Money::format($o->grand_total),
                'placed_at' => $o->placed_at?->format('M d, H:i'),
                'url' => "/admin/orders/{$o->order_number}",
            ]),
            'low_stock_products' => Product::where('track_inventory', true)
                ->where('stock_quantity', '<=', $lowStock)
                ->orderBy('stock_quantity')
                ->limit(6)
                ->get()
                ->map(fn (Product $p) => ['name' => $p->name, 'stock' => $p->stock_quantity, 'url' => "/admin/products/{$p->slug}/edit"]),
        ]);
    }
}
