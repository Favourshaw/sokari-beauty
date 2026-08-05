import { SectionHeader } from '@/components/store/section-header';
import StoreLayout from '@/layouts/store-layout';
import { Head } from '@inertiajs/react';
import { Mail, MapPin, Phone } from 'lucide-react';

const details = [
    { icon: Mail, label: 'Email', value: 'hello@sokaribeauty.com' },
    { icon: Phone, label: 'Phone', value: '+44 20 1234 5678' },
    { icon: MapPin, label: 'Studio', value: 'London, United Kingdom' },
];

export default function Contact() {
    return (
        <StoreLayout>
            <Head title="Contact — Sokari Beauty" />
            <section className="section-y">
                <div className="store-container grid gap-12 lg:grid-cols-2">
                    <div>
                        <SectionHeader eyebrow="Get in touch" title="We’d love to hear from you" align="left" />
                        <div className="mt-8 flex flex-col gap-5">
                            {details.map((detail) => (
                                <div key={detail.label} className="flex items-center gap-4">
                                    <span className="bg-primary/10 text-primary flex h-11 w-11 items-center justify-center rounded-full">
                                        <detail.icon size={18} />
                                    </span>
                                    <div>
                                        <p className="text-muted-foreground text-xs tracking-wide uppercase">{detail.label}</p>
                                        <p className="text-sm font-medium">{detail.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
                        <input placeholder="Your name" className="border-border focus:ring-primary h-11 rounded-xl border px-4 text-sm outline-none focus:ring-2" />
                        <input type="email" placeholder="Email address" className="border-border focus:ring-primary h-11 rounded-xl border px-4 text-sm outline-none focus:ring-2" />
                        <textarea placeholder="Message" rows={5} className="border-border focus:ring-primary rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2" />
                        <button type="submit" className="bg-primary text-primary-foreground h-11 rounded-full text-sm font-medium transition-transform hover:-translate-y-0.5">
                            Send Message
                        </button>
                    </form>
                </div>
            </section>
        </StoreLayout>
    );
}
