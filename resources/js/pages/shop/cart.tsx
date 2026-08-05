import { SectionHeader } from '@/components/store/section-header';
import StoreLayout from '@/layouts/store-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartLine {
    id: number;
    name: string;
    slug: string;
    variant: string | null;
    image: string | null;
    unit_price_formatted: string;
    quantity: number;
    line_total_formatted: string;
    url: string;
}

interface CartData {
    items: CartLine[];
    subtotal_formatted: string;
    count: number;
}

export default function Cart({ cart }: { cart: CartData }) {
    function setQty(id: number, quantity: number) {
        router.patch(`/cart/items/${id}`, { quantity }, { preserveScroll: true });
    }

    function remove(id: number) {
        router.delete(`/cart/items/${id}`, { preserveScroll: true });
    }

    return (
        <StoreLayout>
            <Head title="Your Bag — Sokari Beauty" />
            <div className="section-y">
                <div className="store-container">
                    <SectionHeader eyebrow="Your Bag" title={cart.count > 0 ? `${cart.count} item${cart.count > 1 ? 's' : ''}` : 'Your bag is empty'} />

                    {cart.items.length === 0 ? (
                        <div className="mt-10 flex flex-col items-center gap-6">
                            <p className="text-muted-foreground text-sm">Looks like you haven’t added anything yet.</p>
                            <Link href="/shop" className="bg-primary text-primary-foreground rounded-full px-7 py-3 text-sm font-medium">
                                Continue Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_360px]">
                            <div className="flex flex-col divide-y">
                                {cart.items.map((item) => (
                                    <div key={item.id} className="flex gap-4 py-5">
                                        <Link href={item.url} className="bg-muted h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                                            {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-contain p-1" />}
                                        </Link>
                                        <div className="flex flex-1 flex-col">
                                            <div className="flex justify-between gap-4">
                                                <div>
                                                    <Link href={item.url} className="hover:text-primary text-sm font-medium">
                                                        {item.name}
                                                    </Link>
                                                    {item.variant && <p className="text-muted-foreground text-xs">{item.variant}</p>}
                                                    <p className="text-muted-foreground mt-1 text-xs">{item.unit_price_formatted} each</p>
                                                </div>
                                                <span className="text-primary text-sm font-semibold">{item.line_total_formatted}</span>
                                            </div>
                                            <div className="mt-auto flex items-center justify-between">
                                                <div className="border-border flex items-center gap-3 rounded-full border px-3 py-1.5">
                                                    <button onClick={() => setQty(item.id, item.quantity - 1)} aria-label="Decrease" className="hover:text-primary">
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="w-5 text-center text-sm">{item.quantity}</span>
                                                    <button onClick={() => setQty(item.id, item.quantity + 1)} aria-label="Increase" className="hover:text-primary">
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <button onClick={() => remove(item.id)} className="text-muted-foreground hover:text-destructive flex items-center gap-1 text-xs">
                                                    <Trash2 size={14} /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <aside className="bg-cream h-fit rounded-3xl p-6">
                                <h3 className="text-sm font-semibold tracking-wide uppercase">Order Summary</h3>
                                <div className="mt-4 flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-semibold">{cart.subtotal_formatted}</span>
                                </div>
                                <p className="text-muted-foreground mt-2 text-xs">Shipping and taxes calculated at checkout.</p>
                                <Link
                                    href="/checkout"
                                    className="bg-primary text-primary-foreground mt-6 flex w-full items-center justify-center rounded-full py-3.5 text-sm font-medium transition-transform hover:-translate-y-0.5"
                                >
                                    Proceed to Checkout
                                </Link>
                                <Link href="/shop" className="text-muted-foreground hover:text-primary mt-3 block text-center text-xs">
                                    Continue shopping
                                </Link>
                            </aside>
                        </div>
                    )}
                </div>
            </div>
        </StoreLayout>
    );
}
