<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductRequest;
use App\Models\Category;
use App\Models\Collection;
use App\Models\Product;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $products = Product::query()
            ->with('images')
            ->when($request->string('q')->toString(), fn ($q, $term) => $q->search($term))
            ->when($request->string('status')->toString(), fn ($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Product $p) => [
                'id' => $p->id,
                'slug' => $p->slug,
                'name' => $p->name,
                'sku' => $p->sku,
                'price' => Money::format($p->price),
                'stock' => $p->stock_quantity,
                'status' => $p->status->value,
                'image' => $p->images->first()?->path,
            ]);

        return Inertia::render('admin/products/index', [
            'products' => $products,
            'filters' => ['q' => $request->string('q')->toString(), 'status' => $request->string('status')->toString()],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/products/form', $this->formData());
    }

    public function store(ProductRequest $request): RedirectResponse
    {
        $product = Product::create($this->payload($request));
        $this->syncCollections($product, $request);
        $this->handleImages($product, $request);

        return redirect()->route('admin.products.index')->with('success', 'Product created.');
    }

    public function edit(Product $product): Response
    {
        $product->load('images', 'collections');

        return Inertia::render('admin/products/form', [
            ...$this->formData(),
            'product' => [
                'id' => $product->id,
                'slug' => $product->slug,
                'name' => $product->name,
                'sku' => $product->sku,
                'category_id' => $product->category_id,
                'brand' => $product->brand,
                'short_description' => $product->short_description,
                'description' => $product->description,
                'price' => Money::toDecimal($product->price),
                'compare_at_price' => $product->compare_at_price ? Money::toDecimal($product->compare_at_price) : '',
                'stock_quantity' => $product->stock_quantity,
                'track_inventory' => $product->track_inventory,
                'status' => $product->status->value,
                'is_featured' => $product->is_featured,
                'collection_ids' => $product->collections->pluck('id'),
                'images' => $product->images->map(fn ($i) => ['id' => $i->id, 'path' => $i->path]),
            ],
        ]);
    }

    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        $product->update($this->payload($request));
        $this->syncCollections($product, $request);
        $this->handleImages($product, $request);

        foreach ($request->input('delete_images', []) as $imageId) {
            $product->images()->whereKey($imageId)->delete();
        }

        return redirect()->route('admin.products.index')->with('success', 'Product updated.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        return back()->with('success', 'Product deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function formData(): array
    {
        return [
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'collections' => Collection::orderBy('title')->get(['id', 'title']),
            'statuses' => array_map(fn (ProductStatus $s) => $s->value, ProductStatus::cases()),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(ProductRequest $request): array
    {
        return [
            'name' => $request->validated('name'),
            'sku' => $request->validated('sku'),
            'category_id' => $request->validated('category_id'),
            'brand' => $request->validated('brand'),
            'short_description' => $request->validated('short_description'),
            'description' => $request->validated('description'),
            'price' => Money::toPence($request->validated('price')),
            'compare_at_price' => $request->validated('compare_at_price') ? Money::toPence($request->validated('compare_at_price')) : null,
            'stock_quantity' => $request->validated('stock_quantity'),
            'track_inventory' => $request->boolean('track_inventory'),
            'status' => $request->validated('status'),
            'is_featured' => $request->boolean('is_featured'),
            'published_at' => now(),
        ];
    }

    private function syncCollections(Product $product, ProductRequest $request): void
    {
        $product->collections()->sync($request->validated('collection_ids') ?? []);
    }

    private function handleImages(Product $product, Request $request): void
    {
        if (! $request->hasFile('images')) {
            return;
        }

        $hasPrimary = $product->images()->where('is_primary', true)->exists();
        foreach ($request->file('images') as $index => $file) {
            $path = $file->store('products', 'public');
            $product->images()->create([
                'path' => '/storage/'.$path,
                'alt' => $product->name,
                'position' => $index,
                'is_primary' => ! $hasPrimary && $index === 0,
            ]);
        }
    }
}
