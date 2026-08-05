import { MarqueeStrip } from '@/components/store/marquee-strip';
import { ProductCard } from '@/components/store/product-card';
import { RatingStars } from '@/components/store/rating-stars';
import { SectionHeader } from '@/components/store/section-header';
import StoreLayout from '@/layouts/store-layout';
import { type BlogPreview, type FaqItem, type FeatureItem, type HeroSlide, type HomeTabData, type PromoBanner, type Testimonial } from '@/types/store';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Leaf, Minus, Plus, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HomeProps {
    tabs: HomeTabData[];
    hero: HeroSlide[];
    promos: PromoBanner[];
    features: FeatureItem[];
    ingredients: string[];
    testimonials: Testimonial[];
    posts: BlogPreview[];
    faqs: FaqItem[];
    gallery: string[];
}

const marqueeItems = ['Rescue Your Skin', 'Made With Love', 'New Season Essential', 'Clean Ingredients'];

export default function Home({ tabs, hero, promos, features, ingredients, testimonials, posts, faqs, gallery }: HomeProps) {
    return (
        <StoreLayout>
            <Head title="Sokari Beauty — Conscious Skincare" />
            <HeroSection slides={hero} />
            <StorySection />
            <ProductTabs tabs={tabs} />
            <PromoSection promos={promos} />
            <MarqueeStrip items={marqueeItems} />
            <FeatureSection features={features} />
            <BeforeAfterSection />
            <TestimonialSection testimonials={testimonials} />
            <BlogSection posts={posts} />
            <FaqSection faqs={faqs} ingredients={ingredients} />
            <GallerySection images={gallery} />
        </StoreLayout>
    );
}

function HeroSection({ slides }: { slides: HeroSlide[] }) {
    const [active, setActive] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setActive((v) => (v + 1) % slides.length), 6000);
        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        <section className="relative h-[70vh] min-h-[520px] w-full overflow-hidden">
            {slides.map((slide, i) => (
                <img
                    key={slide.image}
                    src={slide.image}
                    alt=""
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${i === active ? 'opacity-100' : 'opacity-0'}`}
                />
            ))}
            <div className="absolute inset-0 bg-black/25" />
            <div className="store-container relative flex h-full flex-col justify-center">
                <div className="max-w-xl text-white">
                    <h1 className="text-4xl leading-[1.05] font-light tracking-tight sm:text-6xl lg:text-7xl">
                        {slides[active]?.title}
                        <br />
                        {slides[active]?.title2}
                    </h1>
                    <p className="mt-5 max-w-md text-sm text-white/85">
                        Transform your look and elevate your confidence with clean, effective skincare — unlocking your true glow.
                    </p>
                    <Link
                        href="/shop"
                        className="text-primary mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-medium transition-transform hover:-translate-y-0.5"
                    >
                        Explore Now <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        aria-label={`Slide ${i + 1}`}
                        onClick={() => setActive(i)}
                        className={`h-1.5 rounded-full transition-all ${i === active ? 'bg-primary w-8' : 'w-4 bg-white/60'}`}
                    />
                ))}
            </div>
        </section>
    );
}

function StorySection() {
    return (
        <section className="section-y">
            <div className="store-container flex flex-col items-center gap-8 text-center">
                <p className="max-w-4xl text-2xl leading-snug font-light tracking-tight text-balance sm:text-3xl lg:text-4xl">
                    We are dedicated to elevating standards in beauty and care — creating confidence and timeless elegance for everyone.
                </p>
                <Link
                    href="/about"
                    className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium transition-transform hover:-translate-y-0.5"
                >
                    Read Our Story <ArrowRight size={16} />
                </Link>
            </div>
        </section>
    );
}

function ProductTabs({ tabs }: { tabs: HomeTabData[] }) {
    const [active, setActive] = useState(tabs[0]?.key ?? 'hot');
    const activeTab = tabs.find((t) => t.key === active) ?? tabs[0];

    return (
        <section className="section-y pt-0">
            <div className="store-container">
                <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-end">
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActive(tab.key)}
                                className={`text-2xl font-light tracking-tight transition-colors sm:text-3xl ${
                                    active === tab.key ? 'text-foreground' : 'text-muted-foreground/50 hover:text-muted-foreground'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <Link href="/shop" className="text-primary inline-flex items-center gap-1.5 text-sm font-medium">
                        Shop All Products <ArrowRight size={15} />
                    </Link>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3">
                    {activeTab?.products.map((product) => <ProductCard key={product.id} product={product} />)}
                    {activeTab && activeTab.products.length === 0 && (
                        <p className="text-muted-foreground col-span-full py-12 text-center text-sm">No products in this collection yet.</p>
                    )}
                </div>
            </div>
        </section>
    );
}

function PromoSection({ promos }: { promos: PromoBanner[] }) {
    return (
        <section className="section-y pt-0">
            <div className="store-container grid gap-5 md:grid-cols-2">
                {promos.map((promo) => (
                    <Link key={promo.href} href={promo.href} className="group relative aspect-[5/4] overflow-hidden rounded-3xl sm:aspect-[16/10]">
                        <img src={promo.image} alt={promo.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                            <span className="text-xs tracking-[0.2em] uppercase">{promo.eyebrow}</span>
                            <h3 className="mt-2 max-w-[14ch] text-2xl font-light sm:text-3xl">{promo.title}</h3>
                            <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/90 px-5 py-2 text-sm font-medium text-black">
                                Shop Now <ArrowRight size={15} />
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

function FeatureSection({ features }: { features: FeatureItem[] }) {
    return (
        <section className="section-y">
            <div className="store-container">
                <div className="bg-peach-cream rounded-[2rem] px-6 py-16 sm:px-12">
                    <SectionHeader eyebrow="Conscious Beauty" title="Five ingredients. Nothing more." />
                    <div className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature) => (
                            <div key={feature.title} className="flex flex-col gap-3">
                                <span className="bg-primary/10 text-primary flex h-11 w-11 items-center justify-center rounded-full">
                                    <Leaf size={18} />
                                </span>
                                <h3 className="text-base font-medium">{feature.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{feature.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function BeforeAfterSection() {
    return (
        <section className="section-y pt-0">
            <div className="store-container">
                <SectionHeader title="Before & After" />
                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                    {[
                        { src: '/images/section/skin-before.jpg', label: 'Before' },
                        { src: '/images/section/skin-after.jpg', label: 'After' },
                    ].map((item) => (
                        <div key={item.label} className="relative aspect-[16/9] overflow-hidden rounded-3xl">
                            <img src={item.src} alt={item.label} className="h-full w-full object-cover" />
                            <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-4 py-1.5 text-xs font-medium tracking-wide uppercase">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function TestimonialSection({ testimonials }: { testimonials: Testimonial[] }) {
    return (
        <section className="section-y bg-cream">
            <div className="store-container">
                <SectionHeader eyebrow="Loved by many" title="What they are saying" />
                <div className="mt-12 grid gap-6 md:grid-cols-3">
                    {testimonials.map((t) => (
                        <figure key={t.name} className="bg-background flex flex-col gap-4 rounded-3xl p-8 shadow-sm">
                            <RatingStars rating={t.rating} />
                            <blockquote className="text-muted-foreground text-sm leading-relaxed">“{t.quote}”</blockquote>
                            <figcaption className="mt-2 flex items-center gap-3">
                                <img src={t.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                                <div>
                                    <p className="text-sm font-medium">{t.name}</p>
                                    <p className="text-muted-foreground text-xs">{t.role}</p>
                                </div>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}

function BlogSection({ posts }: { posts: BlogPreview[] }) {
    const [large, ...rest] = posts;

    return (
        <section className="section-y">
            <div className="store-container">
                <SectionHeader eyebrow="Journal" title="From the Sokari edit" />
                <div className="mt-12 grid gap-5 md:grid-cols-2">
                    {large && <BlogCard post={large} className="md:row-span-2" tall />}
                    <div className="grid gap-5">{rest.map((post) => <BlogCard key={post.title} post={post} />)}</div>
                </div>
            </div>
        </section>
    );
}

function BlogCard({ post, className, tall }: { post: BlogPreview; className?: string; tall?: boolean }) {
    return (
        <Link href="/blog" className={`group relative block overflow-hidden rounded-3xl ${tall ? 'h-full min-h-[280px]' : 'aspect-[16/9]'} ${className ?? ''}`}>
            <img src={post.image} alt={post.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                <span className="w-fit rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-black">{post.tag}</span>
                <span className="mt-3 text-xs text-white/70">{post.date}</span>
                <h3 className="mt-1 max-w-[22ch] text-lg font-light sm:text-xl">{post.title}</h3>
            </div>
        </Link>
    );
}

function FaqSection({ faqs, ingredients }: { faqs: FaqItem[]; ingredients: string[] }) {
    const [open, setOpen] = useState(0);

    return (
        <section className="section-y bg-cream pt-0">
            <div className="store-container grid gap-12 pt-16 lg:grid-cols-2 lg:pt-24">
                <div>
                    <SectionHeader eyebrow="Key actives" title="Powered by proven ingredients" align="left" />
                    <div className="mt-8 flex flex-wrap gap-2.5">
                        {ingredients.map((ingredient) => (
                            <span key={ingredient} className="border-border inline-flex items-center gap-1.5 rounded-full border bg-white px-4 py-2 text-sm">
                                <Sparkles size={13} className="text-primary" /> {ingredient}
                            </span>
                        ))}
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-light tracking-tight sm:text-3xl">Got questions? We’ve got answers</h2>
                    <div className="mt-6 flex flex-col">
                        {faqs.map((faq, i) => (
                            <div key={faq.question} className="border-border border-b">
                                <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 py-4 text-left">
                                    <span className="text-sm font-medium">{faq.question}</span>
                                    {open === i ? <Minus size={16} className="shrink-0" /> : <Plus size={16} className="shrink-0" />}
                                </button>
                                {open === i && <p className="text-muted-foreground pb-4 text-sm leading-relaxed">{faq.answer}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function GallerySection({ images }: { images: string[] }) {
    return (
        <section className="section-y">
            <div className="store-container">
                <SectionHeader eyebrow="@sokaribeauty" title="Join us on Instagram" />
                <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {images.map((src, i) => (
                        <a key={i} href="https://instagram.com" target="_blank" rel="noreferrer" className="group relative aspect-square overflow-hidden rounded-2xl">
                            <img src={src} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
