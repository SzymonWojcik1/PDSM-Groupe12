<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Projet;
use Carbon\Carbon;

class ProjetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $projets = [
            [
                'pro_nom' => 'Projet de développement communautaire',
                'pro_dateDebut' => Carbon::now()->subMonths(12),
                'pro_dateFin' => Carbon::now()->addMonths(24),
                'pro_part_id' => 1 // ONG Développement Plus
            ],
            [
                'pro_nom' => 'Programme de santé rurale',
                'pro_dateDebut' => Carbon::now()->subMonths(6),
                'pro_dateFin' => Carbon::now()->addMonths(18),
                'pro_part_id' => 2 // Fondation Santé pour Tous
            ],
            [
                'pro_nom' => 'Initiative éducative pour tous',
                'pro_dateDebut' => Carbon::now()->subMonths(3),
                'pro_dateFin' => Carbon::now()->addMonths(21),
                'pro_part_id' => 3 // Association Education Sans Frontières
            ],
            [
                'pro_nom' => 'Projet agricole durable',
                'pro_dateDebut' => Carbon::now(),
                'pro_dateFin' => Carbon::now()->addMonths(30),
                'pro_part_id' => 4 // Coopérative Agricole du Sénégal
            ],
            [
                'pro_nom' => 'Innovation sociale et technologique',
                'pro_dateDebut' => Carbon::now()->addMonths(1),
                'pro_dateFin' => Carbon::now()->addMonths(25),
                'pro_part_id' => 5 // Entreprise Sociale Innovante
            ],
            [
                'pro_nom' => 'Autonomisation des femmes',
                'pro_dateDebut' => Carbon::now()->addMonths(2),
                'pro_dateFin' => Carbon::now()->addMonths(26),
                'pro_part_id' => 6 // Association des Femmes Entrepreneures
            ],
            [
                'pro_nom' => 'Protection de l\'environnement',
                'pro_dateDebut' => Carbon::now()->addMonths(3),
                'pro_dateFin' => Carbon::now()->addMonths(27),
                'pro_part_id' => 7 // Fondation pour l'Environnement
            ],
            [
                'pro_nom' => 'Insertion professionnelle des jeunes',
                'pro_dateDebut' => Carbon::now()->addMonths(4),
                'pro_dateFin' => Carbon::now()->addMonths(28),
                'pro_part_id' => 8 // ONG Jeunesse Active
            ],
            [
                'pro_nom' => 'Développement de l\'artisanat local',
                'pro_dateDebut' => Carbon::now()->addMonths(5),
                'pro_dateFin' => Carbon::now()->addMonths(29),
                'pro_part_id' => 9 // Coopérative Artisanale
            ],
            [
                'pro_nom' => 'Formation professionnelle continue',
                'pro_dateDebut' => Carbon::now()->addMonths(6),
                'pro_dateFin' => Carbon::now()->addMonths(30),
                'pro_part_id' => 10 // Entreprise de Formation Professionnelle
            ]
        ];

        foreach ($projets as $projet) {
            Projet::create($projet);
        }
    }
}
