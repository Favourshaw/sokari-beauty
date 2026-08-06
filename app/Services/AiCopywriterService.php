<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Generates or rephrases product copy via any OpenAI-compatible Chat
 * Completions endpoint (configured in config/services.php → 'ai').
 */
class AiCopywriterService
{
    public function isConfigured(): bool
    {
        return ! blank(config('services.ai.key'));
    }

    /**
     * @param  'description'|'short_description'  $field
     * @param  'generate'|'rephrase'  $mode
     * @param  array<string, string|null>  $context
     */
    public function write(string $field, string $mode, array $context, string $tone = 'luxury'): string
    {
        if (! $this->isConfigured()) {
            throw new RuntimeException('AI is not configured. Add an AI_API_KEY to enable it.');
        }

        $response = Http::baseUrl((string) config('services.ai.base_url'))
            ->withToken((string) config('services.ai.key'))
            ->timeout(30)
            ->acceptJson()
            ->post('/chat/completions', [
                'model' => config('services.ai.model'),
                'temperature' => 0.7,
                'max_tokens' => $field === 'short_description' ? 120 : 400,
                'messages' => [
                    ['role' => 'system', 'content' => $this->systemPrompt($tone)],
                    ['role' => 'user', 'content' => $this->userPrompt($field, $mode, $context)],
                ],
            ]);

        if ($response->failed()) {
            throw new RuntimeException('The AI service returned an error ('.$response->status().'). Check your key and model.');
        }

        $text = trim((string) data_get($response->json(), 'choices.0.message.content', ''));

        if ($text === '') {
            throw new RuntimeException('The AI service returned an empty response.');
        }

        return $this->cleanup($text, $field);
    }

    private function systemPrompt(string $tone): string
    {
        $voice = match ($tone) {
            'friendly' => 'warm, approachable and upbeat, while still refined',
            'minimal' => 'spare, understated and confident — short sentences, no fluff',
            default => 'clean, premium and honest — quietly luxurious, never hyperbolic',
        };

        return 'You are a senior copywriter for Sokari Beauty, a UK skincare brand known for effective, '
            .'cruelty-free products with only a few proven ingredients. Write in British English. '
            ."Tone: {$voice}. Never invent specific clinical claims, percentages, or certifications that "
            .'were not provided. Output only the requested copy — no preamble, quotes, markdown or headings.';
    }

    /**
     * @param  array<string, string|null>  $context
     */
    private function userPrompt(string $field, string $mode, array $context): string
    {
        $facts = collect([
            'Product name' => $context['name'] ?? null,
            'Brand' => $context['brand'] ?? null,
            'Category' => $context['category'] ?? null,
            'Short description' => $context['short_description'] ?? null,
            'Key points / notes' => $context['notes'] ?? null,
        ])->filter()->map(fn ($v, $k) => "- {$k}: {$v}")->implode("\n");

        $current = trim((string) ($context['current'] ?? ''));

        $target = $field === 'short_description'
            ? 'a single punchy tagline of at most 160 characters (one line, no line breaks)'
            : 'a product description of 2 to 3 short paragraphs, separated by a blank line, plain text only (no HTML)';

        if ($mode === 'rephrase' && $current !== '') {
            return "Rewrite and improve the following {$field} into {$target}.\n\n"
                ."Existing text:\n{$current}\n\nProduct details:\n{$facts}";
        }

        return "Write {$target} for this product.\n\nProduct details:\n{$facts}";
    }

    private function cleanup(string $text, string $field): string
    {
        // Strip any stray surrounding quotes or markdown the model may add.
        $text = trim($text, "\"' \n\r\t");
        $text = preg_replace('/^#+\s*/m', '', $text) ?? $text;

        if ($field === 'short_description') {
            $text = preg_replace('/\s+/', ' ', $text) ?? $text;

            return mb_substr(trim($text), 0, 160);
        }

        return $text;
    }
}
