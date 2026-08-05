<?php

declare(strict_types=1);

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Services\CurrencyService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CurrencyController extends Controller
{
    public function __construct(private readonly CurrencyService $currency)
    {
    }

    public function switch(Request $request): RedirectResponse
    {
        $data = $request->validate(['code' => ['required', 'string', 'size:3']]);
        $this->currency->setCurrent(strtoupper($data['code']));

        return back();
    }
}
