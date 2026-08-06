import { csrfToken } from '@/lib/csrf';
import { cn } from '@/lib/utils';
import { Loader2, Sparkles, X } from 'lucide-react';
import { useState } from 'react';

export interface AiContext {
    name?: string;
    brand?: string;
    category?: string;
    short_description?: string;
    current?: string;
}

interface AiWriterProps {
    field: 'description' | 'short_description';
    enabled: boolean;
    getContext: () => AiContext;
    onResult: (text: string) => void;
    className?: string;
}

const tones = [
    { value: 'luxury', label: 'Luxury' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'minimal', label: 'Minimal' },
];

export function AiWriter({ field, enabled, getContext, onResult, className }: AiWriterProps) {
    const [open, setOpen] = useState(false);
    const [notes, setNotes] = useState('');
    const [tone, setTone] = useState('luxury');
    const [loading, setLoading] = useState<'generate' | 'rephrase' | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function run(mode: 'generate' | 'rephrase') {
        setLoading(mode);
        setError(null);
        try {
            const ctx = getContext();
            const res = await fetch('/admin/products/ai/write', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': csrfToken(), Accept: 'application/json' },
                body: JSON.stringify({ field, mode, tone, notes, ...ctx }),
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.message ?? 'Something went wrong.');
            onResult(body.text);
            setOpen(false);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Something went wrong.');
        } finally {
            setLoading(null);
        }
    }

    if (!enabled) {
        return (
            <span className={cn('text-muted-foreground inline-flex items-center gap-1 text-xs', className)} title="Add an AI_API_KEY to enable">
                <Sparkles size={12} /> AI (add an API key to enable)
            </span>
        );
    }

    return (
        <div className={cn('relative', className)}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="text-primary hover:bg-primary/10 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium"
            >
                <Sparkles size={13} /> Write with AI
            </button>

            {open && (
                <div className="border-border bg-background absolute right-0 z-20 mt-1 w-72 rounded-xl border p-3 shadow-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">AI copywriter</span>
                        <button type="button" onClick={() => setOpen(false)} className="hover:bg-muted rounded-full p-1"><X size={13} /></button>
                    </div>

                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Key points (optional): ingredients, benefits, size…"
                        className="border-border mt-2 h-16 w-full rounded-lg border px-2 py-1.5 text-xs outline-none"
                    />

                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">Tone</span>
                        <select value={tone} onChange={(e) => setTone(e.target.value)} className="border-border h-7 flex-1 rounded-md border px-2 text-xs">
                            {tones.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>

                    {error && <p className="text-destructive mt-2 text-xs">{error}</p>}

                    <div className="mt-3 flex gap-2">
                        <button
                            type="button"
                            onClick={() => run('generate')}
                            disabled={loading !== null}
                            className="bg-primary text-primary-foreground inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium disabled:opacity-50"
                        >
                            {loading === 'generate' ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} Generate
                        </button>
                        <button
                            type="button"
                            onClick={() => run('rephrase')}
                            disabled={loading !== null}
                            className="border-border inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs font-medium disabled:opacity-50"
                        >
                            {loading === 'rephrase' ? <Loader2 size={13} className="animate-spin" /> : null} Rephrase
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
