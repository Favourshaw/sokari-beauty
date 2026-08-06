<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\BlogPost;
use App\Models\Faq;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ContentSeeder extends Seeder
{
    public function run(): void
    {
        $reviewers = ['Amara O.', 'Sofia R.', 'Kai T.', 'Grace M.', 'Lola A.', 'Chen W.'];
        $bodies = [
            'Absolutely love this — my skin has never felt so hydrated. A permanent part of my routine now.',
            'Visible results within a couple of weeks. Gentle, no irritation, and a little goes a long way.',
            'Beautiful texture and it actually works. Will be repurchasing.',
        ];

        Product::all()->each(function (Product $product) use ($reviewers, $bodies): void {
            foreach (range(1, random_int(2, 3)) as $i) {
                Review::create([
                    'product_id' => $product->id,
                    'author_name' => $reviewers[array_rand($reviewers)],
                    'rating' => random_int(4, 5),
                    'title' => 'Highly recommend',
                    'body' => $bodies[array_rand($bodies)],
                    'is_approved' => true,
                ]);
            }
        });

        $posts = [
            ['title' => 'Why fewer ingredients work better', 'image' => '/images/blog/blog-large.jpg', 'tag' => 'Trends'],
            ['title' => 'The power of simplifying your routine', 'image' => '/images/blog/blog-1.jpg', 'tag' => 'Guide'],
            ['title' => 'Fewer products, better skin', 'image' => '/images/blog/blog-2.jpg', 'tag' => 'Tips'],
        ];
        foreach ($posts as $i => $post) {
            BlogPost::create([
                'title' => $post['title'],
                'slug' => Str::slug($post['title']),
                'excerpt' => 'A short read on building an effective, honest skincare routine with Sokari.',
                'body' => "At Sokari Beauty we believe skincare should be effective and honest. "
                    ."In this piece we explore how a focused routine — built on proven, high-concentration "
                    ."ingredients — delivers better results than a cabinet full of products.\n\n"
                    ."Repair, renew, calm, hydrate, protect. Five ingredients, nothing more.",
                'image' => $post['image'],
                'tag' => $post['tag'],
                'published_at' => now()->subDays(($i + 1) * 6),
                'status' => 'published',
            ]);
        }

        $faqs = [
            ['question' => 'What skin types is Sokari suitable for?', 'answer' => 'Our formulas are designed for all skin types, including sensitive skin.'],
            ['question' => 'How do I place and track an order?', 'answer' => 'Check out securely and you’ll receive a tracking number by email once your order ships. You can also track it from your account.'],
            ['question' => 'Are your products cruelty-free?', 'answer' => 'Yes — every Sokari product is cruelty-free and made without unnecessary fillers.'],
            ['question' => 'What is your returns policy?', 'answer' => 'Unopened products can be returned within 30 days. Contact our team to start a return.'],
            ['question' => 'Do you ship internationally?', 'answer' => 'We ship worldwide from the UK. Options and rates are shown at checkout.'],
        ];
        foreach ($faqs as $i => $faq) {
            Faq::create($faq + ['position' => $i, 'is_active' => true]);
        }
    }
}
