<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CollectionController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/collections', [
            'collections' => Collection::withCount('products')->orderBy('position')->get()
                ->map(fn (Collection $c) => [
                    'id' => $c->id,
                    'title' => $c->title,
                    'slug' => $c->slug,
                    'home_tab' => $c->home_tab?->value,
                    'is_featured' => $c->is_featured,
                    'is_active' => $c->is_active,
                    'products_count' => $c->products_count,
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Collection::create($this->validated($request));

        return back()->with('success', 'Collection created.');
    }

    public function update(Request $request, Collection $collection): RedirectResponse
    {
        $collection->update($this->validated($request));

        return back()->with('success', 'Collection updated.');
    }

    public function destroy(Collection $collection): RedirectResponse
    {
        $collection->delete();

        return back()->with('success', 'Collection deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:500'],
            'home_tab' => ['nullable', Rule::in(['hot', 'new', 'best'])],
            'is_featured' => ['boolean'],
            'is_active' => ['boolean'],
        ]);
    }
}
