<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(UserSeeder::class);
        $this->call(PartenaireSeeder::class);
        $this->call(ProjetSeeder::class);
        $this->call(ActiviteSeeder::class);
        $this->call([
            UserSeeder::class,
            PartenaireSeeder::class,
            ProjetSeeder::class,
            BeneficiaireSeeder::class,
            ActivitesSeeder::class,
        ]);
    }
}
