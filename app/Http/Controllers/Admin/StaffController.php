<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/staff', [
            'staff' => User::whereIn('role', [Role::SuperAdmin->value, Role::Employee->value])
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'role']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'unique:users,email'],
            'role' => ['required', Rule::in([Role::SuperAdmin->value, Role::Employee->value])],
            'password' => ['required', Password::defaults()],
        ]);

        User::create([
            ...$data,
            'password' => Hash::make($data['password']),
            'email_verified_at' => now(),
        ]);

        return back()->with('success', 'Staff member added.');
    }

    public function update(Request $request, User $staff): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($staff->id)],
            'role' => ['required', Rule::in([Role::SuperAdmin->value, Role::Employee->value])],
            'password' => ['nullable', Password::defaults()],
        ]);

        $staff->update([
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => $data['role'],
            ...($data['password'] ? ['password' => Hash::make($data['password'])] : []),
        ]);

        return back()->with('success', 'Staff member updated.');
    }

    public function destroy(Request $request, User $staff): RedirectResponse
    {
        if ($staff->id === $request->user()->id) {
            return back()->with('error', 'You cannot remove your own account.');
        }

        $staff->delete();

        return back()->with('success', 'Staff member removed.');
    }
}
