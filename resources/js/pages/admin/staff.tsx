import { ResourcePage } from '@/components/admin/resource-page';

interface Staff {
    id: number;
    name: string;
    email: string;
    role: string;
}

export default function StaffPage({ staff }: { staff: Staff[] }) {
    return (
        <ResourcePage<Staff>
            title="Staff"
            description="Team members with access to the admin. Leave password blank when editing to keep it."
            endpoint="/admin/staff"
            items={staff}
            defaults={{ name: '', email: '', role: 'employee', password: '' }}
            columns={[
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'role', label: 'Role', render: (s) => (s.role === 'super_admin' ? 'Super Admin' : 'Employee') },
            ]}
            fields={[
                { name: 'name', label: 'Name' },
                { name: 'email', label: 'Email' },
                { name: 'role', label: 'Role', type: 'select', options: [{ value: 'employee', label: 'Employee' }, { value: 'super_admin', label: 'Super Admin' }] },
                { name: 'password', label: 'Password', type: 'password' },
            ]}
        />
    );
}
