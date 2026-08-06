import StoreLayout from '@/layouts/store-layout';
import { cn } from '@/lib/utils';
import { Head, useForm } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

interface ShippingMethod {
    id: number;
    name: string;
    description: string | null;
    price_formatted: string;
}

interface PaymentMethod {
    value: string;
    label: string;
}

interface CartLine {
    id: number;
    name: string;
    variant: string | null;
    image: string | null;
    quantity: number;
    line_total_formatted: string;
}

interface DeliveryAddress {
    first_name?: string;
    last_name?: string;
    company?: string;
    line1?: string;
    line2?: string;
    city?: string;
    county?: string;
    postcode?: string;
    country?: string;
    phone?: string;
}

interface CheckoutProps {
    cart: { items: CartLine[]; subtotal_formatted: string; count: number };
    shipping_methods: ShippingMethod[];
    payment_methods: PaymentMethod[];
    address: DeliveryAddress | null;
    user: { name?: string; email?: string; phone?: string } | null;
}

interface Quote {
    subtotal_formatted: string;
    discount: number;
    discount_formatted: string;
    shipping_formatted: string;
    tax_formatted: string;
    grand_total_formatted: string;
    coupon_valid: boolean | null;
}

function csrf(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

const input = 'border-border focus:ring-primary h-11 w-full rounded-xl border px-4 text-sm outline-none focus:ring-2';

export default function Checkout({ cart, shipping_methods, payment_methods, address, user }: CheckoutProps) {
    const { data, setData, post, processing, errors } = useForm({
        email: user?.email ?? '',
        phone: user?.phone ?? address?.phone ?? '',
        shipping_method_id: shipping_methods[0]?.id ?? 0,
        payment_method: payment_methods[0]?.value ?? 'cod',
        coupon_code: '',
        customer_note: '',
        shipping: {
            first_name: address?.first_name ?? '',
            last_name: address?.last_name ?? '',
            company: address?.company ?? '',
            line1: address?.line1 ?? '',
            line2: address?.line2 ?? '',
            city: address?.city ?? '',
            county: address?.county ?? '',
            postcode: address?.postcode ?? '',
            country: address?.country ?? 'GB',
            phone: address?.phone ?? '',
        },
    });
    const [quote, setQuote] = useState<Quote | null>(null);

    const fetchQuote = useCallback(async (shippingId: number, coupon: string) => {
        const res = await fetch('/checkout/quote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': csrf(), Accept: 'application/json' },
            body: JSON.stringify({ shipping_method_id: shippingId, coupon_code: coupon }),
        });
        if (res.ok) setQuote(await res.json());
    }, []);

    useEffect(() => {
        fetchQuote(data.shipping_method_id, data.coupon_code);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.shipping_method_id]);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/checkout');
    }

    return (
        <StoreLayout>
            <Head title="Checkout — Sokari Beauty" />
            <div className="section-y">
                <form onSubmit={submit} className="store-container grid gap-10 lg:grid-cols-[1fr_400px]">
                    <div className="flex flex-col gap-8">
                        <section>
                            <h2 className="text-lg font-medium">Contact</h2>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <div>
                                    <input className={input} placeholder="Email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                    {errors.email && <p className="text-destructive mt-1 text-xs">{errors.email}</p>}
                                </div>
                                <input className={input} placeholder="Phone (optional)" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-medium">Shipping address</h2>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <Field name="first_name" placeholder="First name" data={data} setData={setData} errors={errors} />
                                <Field name="last_name" placeholder="Last name" data={data} setData={setData} errors={errors} />
                                <div className="sm:col-span-2">
                                    <Field name="line1" placeholder="Address line 1" data={data} setData={setData} errors={errors} />
                                </div>
                                <div className="sm:col-span-2">
                                    <Field name="line2" placeholder="Address line 2 (optional)" data={data} setData={setData} errors={errors} />
                                </div>
                                <Field name="city" placeholder="City" data={data} setData={setData} errors={errors} />
                                <Field name="county" placeholder="County (optional)" data={data} setData={setData} errors={errors} />
                                <Field name="postcode" placeholder="Postcode" data={data} setData={setData} errors={errors} />
                                <select className={input} value={data.shipping.country} onChange={(e) => setData('shipping', { ...data.shipping, country: e.target.value })}>
                                    <option value="GB">United Kingdom</option>
                                    <option value="US">United States</option>
                                    <option value="IE">Ireland</option>
                                    <option value="FR">France</option>
                                    <option value="DE">Germany</option>
                                    <option value="NG">Nigeria</option>
                                </select>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-medium">Delivery</h2>
                            <div className="mt-4 flex flex-col gap-2">
                                {shipping_methods.map((method) => (
                                    <label
                                        key={method.id}
                                        className={cn('flex cursor-pointer items-center justify-between rounded-xl border p-4', data.shipping_method_id === method.id ? 'border-primary bg-accent/40' : 'border-border')}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input type="radio" checked={data.shipping_method_id === method.id} onChange={() => setData('shipping_method_id', method.id)} />
                                            <div>
                                                <p className="text-sm font-medium">{method.name}</p>
                                                {method.description && <p className="text-muted-foreground text-xs">{method.description}</p>}
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium">{method.price_formatted}</span>
                                    </label>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-medium">Payment</h2>
                            <div className="mt-4 flex flex-col gap-2">
                                {payment_methods.map((method) => (
                                    <label
                                        key={method.value}
                                        className={cn('flex cursor-pointer items-center gap-3 rounded-xl border p-4', data.payment_method === method.value ? 'border-primary bg-accent/40' : 'border-border')}
                                    >
                                        <input type="radio" checked={data.payment_method === method.value} onChange={() => setData('payment_method', method.value)} />
                                        <span className="text-sm font-medium">{method.label}</span>
                                    </label>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="bg-cream h-fit rounded-3xl p-6">
                        <h2 className="text-sm font-semibold tracking-wide uppercase">Order summary</h2>
                        <div className="mt-5 flex flex-col gap-4">
                            {cart.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-3">
                                    <div className="bg-muted relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                                        {item.image && <img src={item.image} alt="" className="h-full w-full object-contain p-0.5" />}
                                        <span className="bg-foreground text-background absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px]">{item.quantity}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{item.name}</p>
                                        {item.variant && <p className="text-muted-foreground text-xs">{item.variant}</p>}
                                    </div>
                                    <span className="text-sm">{item.line_total_formatted}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 flex gap-2">
                            <input
                                className="border-border h-10 flex-1 rounded-full border bg-white px-4 text-sm outline-none"
                                placeholder="Discount code"
                                value={data.coupon_code}
                                onChange={(e) => setData('coupon_code', e.target.value)}
                            />
                            <button type="button" onClick={() => fetchQuote(data.shipping_method_id, data.coupon_code)} className="bg-foreground text-background rounded-full px-4 text-sm">
                                Apply
                            </button>
                        </div>
                        {quote?.coupon_valid === false && <p className="text-destructive mt-1 text-xs">That code isn’t valid.</p>}

                        <div className="mt-5 flex flex-col gap-2 border-t pt-4 text-sm">
                            <Row label="Subtotal" value={quote?.subtotal_formatted ?? cart.subtotal_formatted} />
                            {quote && quote.discount > 0 && <Row label="Discount" value={quote.discount_formatted} />}
                            <Row label="Shipping" value={quote?.shipping_formatted ?? '—'} />
                            <Row label="VAT (incl.)" value={quote?.tax_formatted ?? '—'} muted />
                            <div className="mt-2 flex items-center justify-between border-t pt-3 text-base font-semibold">
                                <span>Total</span>
                                <span>{quote?.grand_total_formatted ?? cart.subtotal_formatted}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-primary text-primary-foreground mt-6 w-full rounded-full py-3.5 text-sm font-medium transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                        >
                            {processing ? 'Placing order…' : 'Place Order'}
                        </button>
                    </aside>
                </form>
            </div>
        </StoreLayout>
    );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <span className={muted ? 'text-muted-foreground' : ''}>{label}</span>
            <span>{value}</span>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Field({ name, placeholder, data, setData, errors }: { name: string; placeholder: string; data: any; setData: any; errors: any }) {
    return (
        <div>
            <input
                className={input}
                placeholder={placeholder}
                value={data.shipping[name] ?? ''}
                onChange={(e) => setData('shipping', { ...data.shipping, [name]: e.target.value })}
            />
            {errors[`shipping.${name}`] && <p className="text-destructive mt-1 text-xs">{errors[`shipping.${name}`]}</p>}
        </div>
    );
}
