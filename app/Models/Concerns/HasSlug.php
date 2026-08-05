<?php

declare(strict_types=1);

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * Auto-generates a unique slug from a source attribute on create when one
 * isn't provided. Implementing models may override slugSource()/slugColumn().
 */
trait HasSlug
{
    public static function bootHasSlug(): void
    {
        static::creating(function (Model $model): void {
            $column = $model->slugColumn();

            if (blank($model->{$column})) {
                $model->{$column} = $model->generateUniqueSlug((string) $model->{$model->slugSource()});
            }
        });
    }

    protected function slugSource(): string
    {
        return 'name';
    }

    protected function slugColumn(): string
    {
        return 'slug';
    }

    protected function generateUniqueSlug(string $value): string
    {
        $base = Str::slug($value) ?: Str::random(8);
        $slug = $base;
        $suffix = 2;

        while (static::query()->where($this->slugColumn(), $slug)->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }

    public function getRouteKeyName(): string
    {
        return $this->slugColumn();
    }
}
