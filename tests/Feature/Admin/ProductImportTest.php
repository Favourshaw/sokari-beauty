<?php

declare(strict_types=1);

use App\Models\Product;
use App\Models\User;
use Illuminate\Http\UploadedFile;

use function Pest\Laravel\actingAs;

function csvFile(string $body): UploadedFile
{
    $header = 'name,sku,category,brand,price,compare_at_price,stock_quantity,status,short_description,description,is_featured,image,collections';

    return UploadedFile::fake()->createWithContent('products.csv', $header."\n".$body);
}

it('imports products from a CSV, creating categories and collections', function () {
    $csv = csvFile(
        'Test Serum,TS-1,Serums,Sokari,19.99,24.99,50,active,Short,Desc,yes,/images/product/product-1.jpg,"New Arrivals, Essentials"'."\n".
        'Clay Mask,,Masks,Sokari,9.50,,10,draft,,,no,,'
    );

    actingAs(User::factory()->superAdmin()->create())
        ->post('/admin/products/import', ['file' => $csv])
        ->assertRedirect();

    expect(Product::count())->toBe(2);

    $serum = Product::where('sku', 'TS-1')->firstOrFail();
    expect($serum->price)->toBe(1999)
        ->and($serum->compare_at_price)->toBe(2499)
        ->and($serum->stock_quantity)->toBe(50)
        ->and($serum->status->value)->toBe('active')
        ->and($serum->category->name)->toBe('Serums')
        ->and($serum->collections->pluck('title')->all())->toContain('New Arrivals', 'Essentials')
        ->and($serum->images->first()->path)->toBe('/images/product/product-1.jpg');
});

it('updates an existing product on re-import matched by SKU', function () {
    $file1 = csvFile('Test Serum,TS-1,Serums,Sokari,19.99,,50,active,,,no,,');
    $admin = User::factory()->superAdmin()->create();

    actingAs($admin)->post('/admin/products/import', ['file' => $file1]);
    expect(Product::count())->toBe(1);

    $file2 = csvFile('Test Serum Renamed,TS-1,Serums,Sokari,29.99,,20,active,,,no,,');
    actingAs($admin)->post('/admin/products/import', ['file' => $file2]);

    expect(Product::count())->toBe(1);
    $product = Product::where('sku', 'TS-1')->firstOrFail();
    expect($product->price)->toBe(2999)->and($product->name)->toBe('Test Serum Renamed');
});

it('forbids customers from importing', function () {
    actingAs(User::factory()->create())
        ->post('/admin/products/import', ['file' => csvFile('X,,,,,,,,,,,,')])
        ->assertForbidden();
});
