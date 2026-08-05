<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\HomeTab;
use App\Models\Concerns\HasSlug;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Collection extends Model
{
    /** @use HasFactory<\Database\Factories\CollectionFactory> */
    use HasFactory, HasSlug;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'image',
        'home_tab',
        'is_featured',
        'position',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'home_tab' => HomeTab::class,
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'position' => 'integer',
        ];
    }

    protected function slugSource(): string
    {
        return 'title';
    }

    /**
     * @return BelongsToMany<Product, $this>
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class)
            ->withPivot('position')
            ->orderBy('collection_product.position');
    }

    /**
     * @param  Builder<Collection>  $query
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }
}
