<?php

declare(strict_types=1);

namespace App\Http\Controllers\Shop;

use App\Enums\HomeTab;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProductCardResource;
use App\Models\Collection;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $tabCollections = Collection::query()
            ->active()
            ->whereNotNull('home_tab')
            ->with(['products' => fn ($q) => $q->active()->with(['images', 'category'])->limit(6)])
            ->get();

        $tabs = collect(HomeTab::cases())->map(function (HomeTab $tab) use ($tabCollections): array {
            $collection = $tabCollections->firstWhere('home_tab', $tab);

            return [
                'key' => $tab->value,
                'label' => $tab->label(),
                'products' => $collection
                    ? ProductCardResource::collection($collection->products)->resolve()
                    : [],
            ];
        })->all();

        return Inertia::render('shop/home', [
            'tabs' => $tabs,
            'hero' => $this->hero(),
            'promos' => $this->promos(),
            'features' => $this->features(),
            'ingredients' => ['Niacinamide', 'Raffinose', 'Adenosine', 'Agar Extract', 'Korean Pearl Extract'],
            'testimonials' => $this->testimonials(),
            'posts' => $this->posts(),
            'faqs' => $this->faqs(),
            'gallery' => collect(range(1, 8))->map(fn ($n) => "/images/gallery/gallery-{$n}.jpg")->all(),
        ]);
    }

    /**
     * @return array<int, array<string, string>>
     */
    private function hero(): array
    {
        return [
            ['image' => '/images/section/hero-1.jpg', 'title' => 'Exquisite Grace,', 'title2' => 'Accuracy'],
            ['image' => '/images/section/hero-2.jpg', 'title' => 'Conscious Beauty,', 'title2' => 'Uncompromised'],
        ];
    }

    /**
     * @return array<int, array<string, string>>
     */
    private function promos(): array
    {
        return [
            ['image' => '/images/section/box-1.jpg', 'eyebrow' => "Happy Mother's Day", 'title' => 'Best gifts for your Mum', 'href' => '/collections/mother-s-day-edit'],
            ['image' => '/images/section/box-2.jpg', 'eyebrow' => 'Discover our universe', 'title' => '50% off Skincare Essentials', 'href' => '/collections/skincare-essentials'],
        ];
    }

    /**
     * @return array<int, array<string, string>>
     */
    private function features(): array
    {
        return [
            ['title' => 'Five ingredients. Nothing more', 'text' => 'Targeted essentials deliver real results: repair, renew, calm, hydrate, protect. No irritation, no wasted money.'],
            ['title' => 'Proven by people like you', 'text' => 'In real-world tests, 94% of users experienced noticeable improvements in just 28 days of daily use.'],
            ['title' => 'Quality over quantity', 'text' => 'We use higher concentrations of effective ingredients, not cheap fillers that dilute the results.'],
            ['title' => 'The last skincare you’ll need', 'text' => 'Powerful, effective ingredients chosen for proven results — not trends, not irritants.'],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function testimonials(): array
    {
        return collect([
            ['name' => 'Kai Tanaka', 'role' => 'Frequent Traveler'],
            ['name' => 'Amara Okafor', 'role' => 'Skincare Enthusiast'],
            ['name' => 'Sofia Rossi', 'role' => 'Verified Buyer'],
        ])->map(fn ($t) => [
            ...$t,
            'rating' => 5,
            'quote' => 'My skin was dehydrated and angry. This range is now a permanent part of my routine and it actually works — visible results within weeks.',
            'avatar' => '/images/avatar/avatar-1.jpg',
        ])->all();
    }

    /**
     * @return array<int, array<string, string>>
     */
    private function posts(): array
    {
        return [
            ['title' => 'Why fewer ingredients work better', 'image' => '/images/blog/blog-large.jpg', 'tag' => 'Trends', 'date' => 'Mar 18, 2025', 'large' => true],
            ['title' => 'The power of simplifying your routine', 'image' => '/images/blog/blog-1.jpg', 'tag' => 'Guide', 'date' => 'Mar 12, 2025', 'large' => false],
            ['title' => 'Fewer products, better skin', 'image' => '/images/blog/blog-2.jpg', 'tag' => 'Tips', 'date' => 'Mar 04, 2025', 'large' => false],
        ];
    }

    /**
     * @return array<int, array<string, string>>
     */
    private function faqs(): array
    {
        return [
            ['question' => 'What skin types is Sokari suitable for?', 'answer' => 'Our formulas are designed for all skin types, including sensitive skin. Each product lists its key actives so you can build a routine with confidence.'],
            ['question' => 'How do I place and track an order?', 'answer' => 'Add products to your bag and check out securely. Once your order ships, you’ll receive a tracking number by email and can follow it from your account.'],
            ['question' => 'Are your products cruelty-free?', 'answer' => 'Yes — every Sokari product is cruelty-free and formulated without unnecessary fillers or irritants.'],
            ['question' => 'What is your returns policy?', 'answer' => 'Unopened products can be returned within 30 days. Contact our team and we’ll guide you through the process.'],
            ['question' => 'Do you ship internationally?', 'answer' => 'We ship worldwide from the UK. Shipping options and rates are shown at checkout based on your destination.'],
        ];
    }
}
