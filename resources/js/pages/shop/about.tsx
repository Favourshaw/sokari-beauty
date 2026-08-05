import { SectionHeader } from '@/components/store/section-header';
import StoreLayout from '@/layouts/store-layout';
import { Head } from '@inertiajs/react';

export default function About() {
    return (
        <StoreLayout>
            <Head title="About — Sokari Beauty" />
            <section className="relative h-[40vh] min-h-[320px] overflow-hidden">
                <img src="/images/section/hero-2.jpg" alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/30" />
                <div className="store-container relative flex h-full items-center">
                    <h1 className="max-w-xl text-4xl font-light tracking-tight text-white sm:text-5xl">Conscious Beauty, Uncompromised</h1>
                </div>
            </section>

            <section className="section-y">
                <div className="store-container grid gap-12 lg:grid-cols-2">
                    <div>
                        <SectionHeader eyebrow="Our Story" title="Effective skincare, nothing more" align="left" />
                    </div>
                    <div className="text-muted-foreground flex flex-col gap-4 text-sm leading-relaxed">
                        <p>
                            Sokari Beauty was founded in the UK on a simple belief: skincare should be effective, honest and kind. We use higher
                            concentrations of proven ingredients — never cheap fillers — so every product earns its place in your routine.
                        </p>
                        <p>
                            Every formula is cruelty-free and thoughtfully made. From our home in the UK we ship worldwide, bringing clean, confident
                            beauty to skin everywhere.
                        </p>
                        <p>Five ingredients. Nothing more. Repair, renew, calm, hydrate, protect.</p>
                    </div>
                </div>
            </section>
        </StoreLayout>
    );
}
