<?php

declare(strict_types=1);

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate(['email' => ['required', 'email', 'max:190']]);

        NewsletterSubscriber::firstOrCreate(
            ['email' => $data['email']],
            ['subscribed_at' => now()],
        );

        return back()->with('success', 'You’re on the list — welcome to Sokari.');
    }
}
