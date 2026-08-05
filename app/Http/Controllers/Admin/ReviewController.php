<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    public function index(Request $request): Response
    {
        $reviews = Review::with('product:id,name,slug')
            ->when($request->string('filter')->toString() === 'pending', fn ($q) => $q->where('is_approved', false))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Review $r) => [
                'id' => $r->id,
                'product' => $r->product?->name,
                'author' => $r->author_name,
                'rating' => $r->rating,
                'title' => $r->title,
                'body' => $r->body,
                'is_approved' => $r->is_approved,
                'date' => $r->created_at?->format('M d, Y'),
            ]);

        return Inertia::render('admin/reviews', [
            'reviews' => $reviews,
            'filter' => $request->string('filter')->toString(),
        ]);
    }

    public function update(Request $request, Review $review): RedirectResponse
    {
        $review->update(['is_approved' => $request->boolean('is_approved')]);
        $this->recalculateRating($review);

        return back()->with('success', 'Review updated.');
    }

    public function destroy(Review $review): RedirectResponse
    {
        $review->delete();
        $this->recalculateRating($review);

        return back()->with('success', 'Review deleted.');
    }

    private function recalculateRating(Review $review): void
    {
        $product = $review->product;
        if ($product === null) {
            return;
        }

        $approved = $product->reviews()->where('is_approved', true);
        $product->update([
            'rating_count' => $approved->count(),
            'rating_avg' => round((float) $approved->avg('rating'), 2),
        ]);
    }
}
