<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Product;
use App\Services\CurrencyService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Compact product shape used by grids, sliders and cards across the storefront.
 *
 * @mixin Product
 */
class ProductCardResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $currency = app(CurrencyService::class);
        $images = $this->images;
        $primary = $images->firstWhere('is_primary', true) ?? $images->first();
        $hover = $images->firstWhere('id', '!=', $primary?->id);

        $badges = [];
        if ($this->isOnSale()) {
            $badges[] = 'Sale';
        }
        if ($this->created_at !== null && $this->created_at->gt(now()->subDays(30))) {
            $badges[] = 'New';
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'category' => $this->whenLoaded('category', fn () => $this->category?->name),
            'price' => $this->price,
            'price_formatted' => $currency->format($this->price),
            'compare_at_price' => $this->compare_at_price,
            'compare_at_formatted' => $this->compare_at_price ? $currency->format($this->compare_at_price) : null,
            'on_sale' => $this->isOnSale(),
            'image' => $primary?->path,
            'hover_image' => $hover?->path,
            'badges' => $badges,
            'rating_avg' => (float) $this->rating_avg,
            'rating_count' => $this->rating_count,
            'in_stock' => $this->inStock(),
            'url' => "/products/{$this->slug}",
        ];
    }
}
