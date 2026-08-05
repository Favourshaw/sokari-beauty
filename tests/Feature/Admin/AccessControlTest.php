<?php

declare(strict_types=1);

use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

it('redirects guests from the admin area to login', function () {
    get('/admin')->assertRedirect('/login');
});

it('forbids customers from the admin area', function () {
    actingAs(User::factory()->create())->get('/admin')->assertForbidden();
});

it('allows employees into the admin dashboard', function () {
    actingAs(User::factory()->employee()->create())->get('/admin')->assertOk();
});

it('blocks employees from super-admin-only settings', function () {
    actingAs(User::factory()->employee()->create())->get('/admin/settings')->assertForbidden();
});

it('allows super admins into settings', function () {
    actingAs(User::factory()->superAdmin()->create())->get('/admin/settings')->assertOk();
});

it('blocks employees from managing staff', function () {
    actingAs(User::factory()->employee()->create())->get('/admin/staff')->assertForbidden();
});
