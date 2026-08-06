<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AiCopywriterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use RuntimeException;

class AiController extends Controller
{
    public function __construct(private readonly AiCopywriterService $ai)
    {
    }

    public function write(Request $request): JsonResponse
    {
        $data = $request->validate([
            'field' => ['required', Rule::in(['description', 'short_description'])],
            'mode' => ['required', Rule::in(['generate', 'rephrase'])],
            'tone' => ['nullable', Rule::in(['luxury', 'friendly', 'minimal'])],
            'name' => ['nullable', 'string', 'max:180'],
            'brand' => ['nullable', 'string', 'max:120'],
            'category' => ['nullable', 'string', 'max:120'],
            'short_description' => ['nullable', 'string', 'max:255'],
            'current' => ['nullable', 'string', 'max:5000'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        if (! $this->ai->isConfigured()) {
            return response()->json(['message' => 'AI is not configured. Add an AI_API_KEY to enable it.'], 503);
        }

        try {
            $text = $this->ai->write(
                field: $data['field'],
                mode: $data['mode'],
                context: [
                    'name' => $data['name'] ?? null,
                    'brand' => $data['brand'] ?? null,
                    'category' => $data['category'] ?? null,
                    'short_description' => $data['short_description'] ?? null,
                    'current' => $data['current'] ?? null,
                    'notes' => $data['notes'] ?? null,
                ],
                tone: $data['tone'] ?? 'luxury',
            );
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 502);
        }

        return response()->json(['text' => $text]);
    }
}
