<?php

declare(strict_types=1);

namespace App\Imports;

use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Collection as ProductCollection;
use App\Models\Product;
use App\Support\Money;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

/**
 * Bulk product importer. Accepts xlsx / xls / csv / ods via Laravel Excel.
 * Upserts by SKU when provided, otherwise by slug derived from the name.
 */
class ProductsImport implements ToCollection, WithHeadingRow
{
    public int $created = 0;

    public int $updated = 0;

    /** @var array<int, string> */
    public array $errors = [];

    /**
     * @param  Collection<int, Collection<string, mixed>>  $rows
     */
    public function collection(Collection $rows): void
    {
        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2; // account for the heading row
            $name = trim((string) $row->get('name', ''));

            if ($name === '') {
                continue; // silently skip blank lines
            }

            $validator = Validator::make($row->toArray(), [
                'name' => ['required', 'string', 'max:160'],
                'price' => ['required'],
            ]);

            if ($validator->fails()) {
                $this->errors[] = "Row {$rowNumber}: ".implode(' ', $validator->errors()->all());

                continue;
            }

            $this->importRow($row, $name);
        }
    }

    /**
     * @param  Collection<string, mixed>  $row
     */
    private function importRow(Collection $row, string $name): void
    {
        $sku = trim((string) $row->get('sku', '')) ?: null;

        $attributes = [
            'name' => $name,
            'brand' => $this->nullable($row->get('brand')),
            'short_description' => $this->nullable($row->get('short_description')),
            'description' => $this->nullable($row->get('description')),
            'price' => Money::toPence($this->number($row->get('price'))),
            'compare_at_price' => $row->get('compare_at_price') ? Money::toPence($this->number($row->get('compare_at_price'))) : null,
            'stock_quantity' => (int) $this->number($row->get('stock_quantity')),
            'status' => $this->status($row->get('status')),
            'is_featured' => $this->boolean($row->get('is_featured')),
            'category_id' => $this->categoryId($row->get('category')),
            'published_at' => now(),
        ];

        if ($sku !== null) {
            $product = Product::withTrashed()->updateOrCreate(['sku' => $sku], $attributes);
        } else {
            $product = Product::withTrashed()->updateOrCreate(['slug' => Str::slug($name)], $attributes + ['sku' => null]);
        }

        if ($product->trashed()) {
            $product->restore();
        }

        $product->wasRecentlyCreated ? $this->created++ : $this->updated++;

        $this->attachImage($product, $row->get('image'));
        $this->attachCollections($product, $row->get('collections'));
    }

    private function categoryId(mixed $value): ?int
    {
        $name = $this->nullable($value);
        if ($name === null) {
            return null;
        }

        return Category::firstOrCreate(
            ['slug' => Str::slug($name)],
            ['name' => $name, 'is_active' => true],
        )->id;
    }

    private function attachImage(Product $product, mixed $value): void
    {
        $path = $this->nullable($value);
        if ($path === null) {
            return;
        }

        $product->images()->updateOrCreate(
            ['is_primary' => true],
            ['path' => $path, 'alt' => $product->name, 'position' => 0],
        );
    }

    private function attachCollections(Product $product, mixed $value): void
    {
        $names = $this->nullable($value);
        if ($names === null) {
            return;
        }

        $ids = collect(explode(',', $names))
            ->map(fn (string $title) => trim($title))
            ->filter()
            ->map(fn (string $title) => ProductCollection::firstOrCreate(
                ['slug' => Str::slug($title)],
                ['title' => $title, 'is_active' => true],
            )->id)
            ->all();

        $product->collections()->syncWithoutDetaching($ids);
    }

    private function status(mixed $value): string
    {
        $status = strtolower(trim((string) $value));

        return in_array($status, ProductStatus::values(), true) ? $status : ProductStatus::Draft->value;
    }

    private function boolean(mixed $value): bool
    {
        return in_array(strtolower(trim((string) $value)), ['1', 'yes', 'true', 'y'], true);
    }

    private function number(mixed $value): float
    {
        // Strip currency symbols, thousands separators and spaces.
        return (float) preg_replace('/[^0-9.\-]/', '', (string) $value);
    }

    private function nullable(mixed $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }
}
