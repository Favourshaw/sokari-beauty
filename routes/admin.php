<?php

use App\Http\Controllers\Admin\AiController;
use App\Http\Controllers\Admin\BlogController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CollectionController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DiscountController;
use App\Http\Controllers\Admin\FaqController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ReviewController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\ShippingController;
use App\Http\Controllers\Admin\StaffController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
|
| Guarded by "auth" + "staff". Super-admin-only sections carry the extra
| "super_admin" middleware (staff management, discounts, shipping, refunds,
| store settings).
|
*/

Route::middleware(['auth', 'staff'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

        Route::get('products/import/template', [ProductController::class, 'importTemplate'])->name('products.importTemplate');
        Route::post('products/import', [ProductController::class, 'import'])->name('products.import');
        Route::post('products/ai/write', [AiController::class, 'write'])->middleware('throttle:20,1')->name('products.ai');
        Route::resource('products', ProductController::class)->except('show');
        Route::resource('categories', CategoryController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('collections', CollectionController::class)->only(['index', 'store', 'update', 'destroy']);

        Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
        Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
        Route::post('orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.status');
        Route::post('orders/{order}/fulfill', [OrderController::class, 'fulfill'])->name('orders.fulfill');
        Route::post('orders/{order}/mark-paid', [OrderController::class, 'markPaid'])->name('orders.markPaid');
        Route::post('orders/{order}/mark-delivered', [OrderController::class, 'markDelivered'])->name('orders.markDelivered');

        Route::get('customers', [CustomerController::class, 'index'])->name('customers.index');
        Route::get('customers/{user}', [CustomerController::class, 'show'])->name('customers.show');

        Route::resource('reviews', ReviewController::class)->only(['index', 'update', 'destroy']);
        Route::resource('blog', BlogController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
        Route::resource('faqs', FaqController::class)->only(['index', 'store', 'update', 'destroy']);

        // Super-admin only.
        Route::middleware('super_admin')->group(function () {
            Route::resource('staff', StaffController::class)->only(['index', 'store', 'update', 'destroy']);
            Route::resource('discounts', DiscountController::class)->only(['index', 'store', 'update', 'destroy']);
            Route::resource('shipping', ShippingController::class)->only(['index', 'store', 'update', 'destroy']);
            Route::post('orders/{order}/refund', [OrderController::class, 'refund'])->name('orders.refund');
            Route::get('settings', [SettingController::class, 'edit'])->name('settings.edit');
            Route::put('settings', [SettingController::class, 'update'])->name('settings.update');
        });
    });
