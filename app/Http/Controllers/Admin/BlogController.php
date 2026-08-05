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
        return Inertia::render('admin/blog', [
            'posts' => BlogPost::latest()->get()->map(fn (BlogPost $p) => [
                'id' => $p->id,
                'title' => $p->title,
                'excerpt' => $p->excerpt,
                'body' => $p->body,
                'image' => $p->image,
                'tag' => $p->tag,
                'status' => $p->status,
            ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        BlogPost::create($this->payload($request));

        return back()->with('success', 'Post created.');
    }

    public function update(Request $request, BlogPost $blog): RedirectResponse
    {
        $blog->update($this->payload($request));

        return back()->with('success', 'Post updated.');
    }

    public function destroy(BlogPost $blog): RedirectResponse
    {
        $blog->delete();

        return back()->with('success', 'Post deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Request $request): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:180'],
            'excerpt' => ['nullable', 'string', 'max:255'],
            'body' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:255'],
            'tag' => ['nullable', 'string', 'max:60'],
            'status' => ['required', Rule::in(['draft', 'published'])],
        ]);

        return [
            ...$data,
            'published_at' => $data['status'] === 'published' ? now() : null,
        ];
    }
}
