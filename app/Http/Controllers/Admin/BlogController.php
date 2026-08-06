<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/blog/index', [
            'posts' => BlogPost::latest()->get()->map(fn (BlogPost $p) => [
                'id' => $p->id,
                'slug' => $p->slug,
                'title' => $p->title,
                'tag' => $p->tag,
                'status' => $p->status,
                'image' => $p->image,
            ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/blog/form');
    }

    public function store(Request $request): RedirectResponse
    {
        BlogPost::create($this->payload($request));

        return redirect()->route('admin.blog.index')->with('success', 'Post created.');
    }

    public function edit(BlogPost $blog): Response
    {
        return Inertia::render('admin/blog/form', [
            'post' => [
                'id' => $blog->id,
                'slug' => $blog->slug,
                'title' => $blog->title,
                'excerpt' => $blog->excerpt,
                'body' => $blog->body,
                'image' => $blog->image,
                'tag' => $blog->tag,
                'status' => $blog->status,
            ],
        ]);
    }

    public function update(Request $request, BlogPost $blog): RedirectResponse
    {
        $blog->update($this->payload($request, $blog));

        return redirect()->route('admin.blog.index')->with('success', 'Post updated.');
    }

    public function destroy(BlogPost $blog): RedirectResponse
    {
        $blog->delete();

        return back()->with('success', 'Post deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Request $request, ?BlogPost $existing = null): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:180'],
            'excerpt' => ['nullable', 'string', 'max:255'],
            'body' => ['nullable', 'string'],
            'tag' => ['nullable', 'string', 'max:60'],
            'status' => ['required', Rule::in(['draft', 'published'])],
            'image' => ['nullable', 'image', 'max:4096'],
        ]);

        $image = $existing?->image;
        if ($request->hasFile('image')) {
            $image = '/storage/'.$request->file('image')->store('blog', 'public');
        }

        return [
            'title' => $data['title'],
            'excerpt' => $data['excerpt'] ?? null,
            'body' => $data['body'] ?? null,
            'tag' => $data['tag'] ?? null,
            'status' => $data['status'],
            'image' => $image,
            'published_at' => $data['status'] === 'published'
                ? ($existing?->published_at ?? now())
                : null,
        ];
    }
}
