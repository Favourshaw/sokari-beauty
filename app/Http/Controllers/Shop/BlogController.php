<?php

declare(strict_types=1);

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    public function index(): Response
    {
        $posts = BlogPost::query()
            ->published()
            ->latest('published_at')
            ->paginate(9)
            ->through(fn (BlogPost $post) => [
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'image' => $post->image,
                'tag' => $post->tag,
                'date' => $post->published_at?->format('M d, Y'),
                'url' => "/blog/{$post->slug}",
            ]);

        return Inertia::render('shop/blog', ['posts' => $posts]);
    }

    public function show(BlogPost $post): Response
    {
        abort_unless($post->status === 'published', 404);

        return Inertia::render('shop/blog-post', [
            'post' => [
                'title' => $post->title,
                'body' => $post->body,
                'image' => $post->image,
                'tag' => $post->tag,
                'date' => $post->published_at?->format('M d, Y'),
            ],
        ]);
    }
}
