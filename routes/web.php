<?php

use App\Http\Controllers\Account\OrderController as AccountOrderController;
use App\Http\Controllers\Account\WishlistController;
use App\Http\Controllers\Payment\StripeController;
use App\Http\Controllers\Payment\WebhookController;
use App\Http\Controllers\Shop\BlogController;
use App\Http\Controllers\Shop\CartController;
use App\Http\Controllers\Shop\CheckoutController;
use App\Http\Controllers\Shop\CurrencyController;
use App\Http\Controllers\Shop\HomeController;
use App\Http\Controllers\Shop\NewsletterController;
use App\Http\Controllers\Shop\PageController;
use App\Http\Controllers\Shop\ProductController;
use App\Http\Controllers\Shop\ReviewController;
use App\Http\Controllers\Shop\ShopController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Storefront
|--------------------------------------------------------------------------
*/
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/shop', [ShopController::class, 'index'])->name('shop');
Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');
Route::post('/products/{product}/reviews', [ReviewController::class, 'store'])->middleware('auth')->name('reviews.store');
Route::get('/about', [PageController::class, 'about'])->name('about');
Route::get('/contact', [PageController::class, 'contact'])->name('contact');
Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{post}', [BlogController::class, 'show'])->name('blog.show');
Route::post('/newsletter', [NewsletterController::class, 'store'])->name('newsletter.store');
Route::post('/currency', [CurrencyController::class, 'switch'])->name('currency.switch');

/*
|--------------------------------------------------------------------------
| Cart & checkout
|--------------------------------------------------------------------------
*/
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
Route::patch('/cart/items/{item}', [CartController::class, 'update'])->name('cart.update');
Route::delete('/cart/items/{item}', [CartController::class, 'remove'])->name('cart.remove');

Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
Route::post('/checkout/quote', [CheckoutController::class, 'quote'])->name('checkout.quote');
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
Route::get('/checkout/{order}/pay', [StripeController::class, 'checkout'])->name('checkout.stripe');
Route::get('/order/{order}/confirmation', [CheckoutController::class, 'confirmation'])->name('checkout.confirmation');

// Stripe webhook (CSRF-exempt via bootstrap/app.php).
Route::post('/stripe/webhook', [WebhookController::class, 'handle'])->name('webhook.stripe');

/*
|--------------------------------------------------------------------------
| Customer account
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->prefix('account')->name('account.')->group(function () {
    Route::get('orders', [AccountOrderController::class, 'index'])->name('orders');
    Route::get('orders/{order}', [AccountOrderController::class, 'show'])->name('orders.show');
    Route::get('wishlist', [WishlistController::class, 'index'])->name('wishlist');
    Route::post('wishlist/{product}', [WishlistController::class, 'toggle'])->name('wishlist.toggle');
});

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return redirect(auth()->user()->isStaff() ? '/admin' : '/account/orders');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
