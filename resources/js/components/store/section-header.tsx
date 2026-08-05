import { cn } from '@/lib/utils';

interface SectionHeaderProps {
    eyebrow?: string;
    title: string;
    align?: 'left' | 'center';
    className?: string;
}

export function SectionHeader({ eyebrow, title, align = 'center', className }: SectionHeaderProps) {
    return (
        <div className={cn('flex flex-col gap-2', align === 'center' ? 'items-center text-center' : 'items-start text-left', className)}>
            {eyebrow && <span className="text-primary text-xs font-medium tracking-[0.2em] uppercase">{eyebrow}</span>}
            <h2 className="text-3xl leading-tight font-light tracking-tight text-balance sm:text-4xl lg:text-5xl">{title}</h2>
        </div>
    );
}
