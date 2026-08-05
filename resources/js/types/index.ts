import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export type UserRole = 'super_admin' | 'employee' | 'customer';

export interface FlashMessages {
    success?: string | null;
    error?: string | null;
}

export interface CartSummary {
    count: number;
    subtotal: number;
    subtotal_formatted: string;
}

export interface CurrencyOption {
    code: string;
    symbol: string;
    name: string;
}

export interface CurrencyState {
    current: { code: string; symbol: string };
    available: CurrencyOption[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    flash: FlashMessages;
    cart: CartSummary;
    currency: CurrencyState;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    phone?: string | null;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
