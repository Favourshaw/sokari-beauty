export interface ProductCard {
    id: number;
    name: string;
    slug: string;
    category?: string | null;
    price: number;
    price_formatted: string;
    compare_at_price?: number | null;
    compare_at_formatted?: string | null;
    on_sale: boolean;
    image?: string | null;
    hover_image?: string | null;
    badges: string[];
    rating_avg: number;
    rating_count: number;
    in_stock: boolean;
    url: string;
}

export interface HomeTabData {
    key: string;
    label: string;
    products: ProductCard[];
}

export interface HeroSlide {
    image: string;
    title: string;
    title2: string;
}

export interface PromoBanner {
    image: string;
    eyebrow: string;
    title: string;
    href: string;
}

export interface FeatureItem {
    title: string;
    text: string;
}

export interface Testimonial {
    name: string;
    role: string;
    rating: number;
    quote: string;
    avatar: string;
}

export interface BlogPreview {
    title: string;
    image: string;
    tag: string;
    date: string;
    large: boolean;
}

export interface FaqItem {
    question: string;
    answer: string;
}
