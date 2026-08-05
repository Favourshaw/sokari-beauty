<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\Money;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $customers = User::query()
            ->where('role', Role::Customer->value)
            ->withCount('orders')
            ->when($request->string('q')->toString(), fn ($q, $term) => $q->where(fn ($w) => $w->where('name', 'like', "%{$term}%")->orWhere('email', 'like', "%{$term}%")))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'orders_count' => $u->orders_count,
                'joined' => $u->created_at?->format('M d, Y'),
                'url' => "/admin/customers/{$u->id}",
            ]);

        return Inertia::render('admin/customers/index', [
            'customers' => $customers,
            'filters' => ['q' => $request->string('q')->toString()],
        ]);
    }

    public function show(User $user): Response
    {
        abort_unless($user->role === Role::Customer, 404);

        return Inertia::render('admin/customers/show', [
            'customer' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'joined' => $user->created_at?->format('M d, Y'),
                'orders' => $user->orders()->latest()->get()->map(fn ($o) => [
                    'order_number' => $o->order_number,
                    'status' => $o->status->value,
                    'total' => Money::format($o->grand_total),
                    'placed_at' => $o->placed_at?->format('M d, Y'),
                    'url' => "/admin/orders/{$o->order_number}",
                ]),
            ],
        ]);
    }
}
