interface MarqueeStripProps {
    items: string[];
}

export function MarqueeStrip({ items }: MarqueeStripProps) {
    // Duplicate the list so the -50% translate loops seamlessly.
    const doubled = [...items, ...items];

    return (
        <div className="border-border overflow-hidden border-y py-6">
            <div className="animate-marquee flex w-max items-center gap-10 whitespace-nowrap">
                {doubled.map((item, i) => (
                    <div key={i} className="flex items-center gap-10">
                        <span className="text-muted-foreground/70 text-2xl font-light tracking-tight sm:text-3xl">{item}</span>
                        <span className="text-primary text-lg">✦</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
