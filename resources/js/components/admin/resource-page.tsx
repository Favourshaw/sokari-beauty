import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

export interface FieldConfig {
    name: string;
    label: string;
    type?: 'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'password';
    options?: { value: string; label: string }[];
    placeholder?: string;
    full?: boolean;
}

export interface ColumnConfig<T> {
    key: string;
    label: string;
    render?: (row: T) => React.ReactNode;
}

interface ResourcePageProps<T extends { id: number }> {
    title: string;
    description?: string;
    endpoint: string;
    items: T[];
    columns: ColumnConfig<T>[];
    fields: FieldConfig[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaults: Record<string, any>;
}

const input = 'border-border h-10 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-primary';

export function ResourcePage<T extends { id: number }>({ title, description, endpoint, items, columns, fields, defaults }: ResourcePageProps<T>) {
    const [editing, setEditing] = useState<T | null>(null);
    const [open, setOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [form, setForm] = useState<Record<string, any>>(defaults);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [errors, setErrors] = useState<Record<string, any>>({});

    function startNew() {
        setEditing(null);
        setForm(defaults);
        setErrors({});
        setOpen(true);
    }

    function startEdit(row: T) {
        setEditing(row);
        setForm({ ...defaults, ...row });
        setErrors({});
        setOpen(true);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
            onError: (e: Record<string, string>) => setErrors(e),
        };
        if (editing) router.put(`${endpoint}/${editing.id}`, form, options);
        else router.post(endpoint, form, options);
    }

    function remove(row: T) {
        if (confirm('Delete this item?')) router.delete(`${endpoint}/${row.id}`, { preserveScroll: true });
    }

    const breadcrumbs: BreadcrumbItem[] = [{ title, href: endpoint }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                        {description && <p className="text-muted-foreground text-sm">{description}</p>}
                    </div>
                    <button onClick={startNew} className="bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium">
                        <Plus size={16} /> New
                    </button>
                </div>

                <div className="border-border overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="text-muted-foreground border-border border-b text-left text-xs uppercase">
                            <tr>
                                {columns.map((col) => <th key={col.key} className="px-4 py-2 font-medium">{col.label}</th>)}
                                <th className="px-4 py-2 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((row) => (
                                <tr key={row.id} className="border-border hover:bg-muted/50 border-b last:border-0">
                                    {columns.map((col) => (
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        <td key={col.key} className="px-4 py-3">{col.render ? col.render(row) : String((row as any)[col.key] ?? '')}</td>
                                    ))}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => startEdit(row)} className="hover:bg-muted rounded-md p-2"><Pencil size={15} /></button>
                                            <button onClick={() => remove(row)} className="hover:bg-muted text-destructive rounded-md p-2"><Trash2 size={15} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && <tr><td colSpan={columns.length + 1} className="text-muted-foreground px-4 py-10 text-center">Nothing here yet.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
                    <div className="bg-background w-full max-w-lg rounded-2xl p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-medium">{editing ? 'Edit' : 'New'} {title.replace(/s$/, '')}</h2>
                            <button onClick={() => setOpen(false)} className="hover:bg-muted rounded-full p-1.5"><X size={16} /></button>
                        </div>
                        <form onSubmit={submit} className="mt-4 grid grid-cols-2 gap-3">
                            {fields.map((field) => (
                                <div key={field.name} className={cn(field.full || field.type === 'textarea' ? 'col-span-2' : 'col-span-1', field.type === 'checkbox' && 'col-span-2')}>
                                    {field.type === 'checkbox' ? (
                                        <label className="flex items-center gap-2 text-sm">
                                            <input type="checkbox" checked={!!form[field.name]} onChange={(e) => setForm({ ...form, [field.name]: e.target.checked })} /> {field.label}
                                        </label>
                                    ) : (
                                        <>
                                            <label className="text-sm font-medium">{field.label}</label>
                                            {field.type === 'textarea' ? (
                                                <textarea className={cn(input, 'h-24 py-2')} value={form[field.name] ?? ''} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} />
                                            ) : field.type === 'select' ? (
                                                <select className={input} value={form[field.name] ?? ''} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}>
                                                    {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                                </select>
                                            ) : (
                                                <input type={field.type ?? 'text'} placeholder={field.placeholder} className={input} value={form[field.name] ?? ''} onChange={(e) => setForm({ ...form, [field.name]: field.type === 'number' ? e.target.value : e.target.value })} />
                                            )}
                                            {errors[field.name] && <p className="text-destructive mt-1 text-xs">{errors[field.name]}</p>}
                                        </>
                                    )}
                                </div>
                            ))}
                            <button type="submit" className="bg-primary text-primary-foreground col-span-2 mt-2 rounded-lg py-2.5 text-sm font-medium">Save</button>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
