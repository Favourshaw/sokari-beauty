<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('customers are redirected to their account orders', function () {
    $this->actingAs(User::factory()->create());

    $this->get('/dashboard')->assertRedirect('/account/orders');
});

test('staff are redirected to the admin dashboard', function () {
    $this->actingAs(User::factory()->superAdmin()->create());

    $this->get('/dashboard')->assertRedirect('/admin');
});