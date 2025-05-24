<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Partenaire;
use App\Enums\Role;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $partenaire = Partenaire::first() ?? Partenaire::factory()->create([
            'part_nom' => 'Partenaire Démo',
            'part_pays' => 'Suisse',
            'part_region' => 'Genève',
        ]);

        $users = [
            ['nom' => 'Wojcik',   'prenom' => 'Szymon',  'email' => 'szymon.wojcik@hes-so.ch'],
            ['nom' => 'Husmann',  'prenom' => 'Yann',    'email' => 'yann.husmann@hes-so.ch'],
            ['nom' => 'Gabioux',  'prenom' => 'Yann',    'email' => 'yann.gabioux@hes-so.ch'],
            ['nom' => 'Bonvin',   'prenom' => 'Benoît',  'email' => 'benoit.bonvin@hes-so.ch'],
        ];

        foreach ($users as $user) {
            User::create([
                ...$user,
                'password' => Hash::make('Password123!'),
                'role' => Role::SIEGE->value,
                'partenaire_id' => $partenaire->part_id,
            ]);
        }

        
    }
}
