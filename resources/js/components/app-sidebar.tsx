import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    FolderTree,
    LayoutGrid,
    Layers,
    MessageSquareText,
    Newspaper,
    Package,
    Settings,
    ShoppingCart,
    Store,
    Tag,
    Truck,
    Users,
    UsersRound,
    HelpCircle,
} from 'lucide-react';
import AppLogo from './app-logo';

const catalogNav: NavItem[] = [
    { title: 'Products', url: '/admin/products', icon: Package },
    { title: 'Collections', url: '/admin/collections', icon: Layers },
    { title: 'Categories', url: '/admin/categories', icon: FolderTree },
];

const salesNav: NavItem[] = [
    { title: 'Orders', url: '/admin/orders', icon: ShoppingCart },
    { title: 'Customers', url: '/admin/customers', icon: Users },
    { title: 'Reviews', url: '/admin/reviews', icon: MessageSquareText },
];

const contentNav: NavItem[] = [
    { title: 'Journal', url: '/admin/blog', icon: Newspaper },
    { title: 'FAQs', url: '/admin/faqs', icon: HelpCircle },
];

const superAdminNav: NavItem[] = [
    { title: 'Discounts', url: '/admin/discounts', icon: Tag },
    { title: 'Shipping', url: '/admin/shipping', icon: Truck },
    { title: 'Staff', url: '/admin/staff', icon: UsersRound },
    { title: 'Settings', url: '/admin/settings', icon: Settings },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user?.role === 'super_admin';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={[{ title: 'Dashboard', url: '/admin', icon: LayoutGrid }]} />
                <SidebarGroup>
                    <SidebarGroupLabel>Catalog</SidebarGroupLabel>
                    <NavMain items={catalogNav} />
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Sales</SidebarGroupLabel>
                    <NavMain items={salesNav} />
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Content</SidebarGroupLabel>
                    <NavMain items={contentNav} />
                </SidebarGroup>
                {isSuperAdmin && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Administration</SidebarGroupLabel>
                        <NavMain items={superAdminNav} />
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/" prefetch>
                                <Store />
                                <span>View storefront</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
