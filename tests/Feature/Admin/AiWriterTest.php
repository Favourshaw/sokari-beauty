<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Support\Facades\Http;

use function Pest\Laravel\actingAs;

it('generates product copy for staff', function () {
    config(['services.ai.key' => 'test-key']);
    Http::fake([
        '*/chat/completions' => Http::response([
            'choices' => [['message' => ['content' => 'A luminous daily serum that hydrates and renews tired skin.']]],
        ]),
    ]);

    actingAs(User::factory()->employee()->create())
        ->postJson('/admin/products/ai/write', [
            'field' => 'description',
            'mode' => 'generate',
            'name' => 'Glow Serum',
            'category' => 'Serums',
            'notes' => 'niacinamide, brightening',
        ])
        ->assertOk()
        ->assertJson(['text' => 'A luminous daily serum that hydrates and renews tired skin.']);

    Http::assertSent(fn ($request) => str_contains($request->url(), '/chat/completions'));
});

it('rejects an invalid field or mode', function () {
    config(['services.ai.key' => 'test-key']);

    actingAs(User::factory()->superAdmin()->create())
        ->postJson('/admin/products/ai/write', ['field' => 'bogus', 'mode' => 'nope'])
        ->assertStatus(422);
});

it('forbids customers from using the AI endpoint', function () {
    actingAs(User::factory()->create())
        ->postJson('/admin/products/ai/write', ['field' => 'description', 'mode' => 'generate', 'name' => 'X'])
        ->assertForbidden();
});

it('returns a graceful error when AI is not configured', function () {
    config(['services.ai.key' => null]);

    actingAs(User::factory()->employee()->create())
        ->postJson('/admin/products/ai/write', ['field' => 'description', 'mode' => 'generate', 'name' => 'X'])
        ->assertStatus(503)
        ->assertJsonStructure(['message']);
});
