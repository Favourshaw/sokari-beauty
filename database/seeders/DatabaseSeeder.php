<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->superAdmin()->create([
            'name' => 'Sokari Admin',
            'email' => 'admin@sokaribeauty.test',
        ]);

        User::factory()->employee()->create([
            'name' => 'Store Employee',
            'email' => 'employee@sokaribeauty.test',
        ]);

        User::factory()->create([
            'name' => 'Jane Customer',
            'email' => 'customer@sokaribeauty.test',
            'role' => Role::Customer,
        ]);

        $this->call([
            CommerceSeeder::class,
            CatalogSeeder::class,
            ContentSeeder::class,
        ]);
    }
}
