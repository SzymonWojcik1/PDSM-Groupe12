<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Partenaire;

class PartenaireSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $partenaires = [
            [
                'part_nom' => 'ONG Développement Plus',
                'part_pays' => 'Sénégal',
                'part_region' => 'Dakar'
            ],
            [
                'part_nom' => 'Fondation Santé pour Tous',
                'part_pays' => 'Sénégal',
                'part_region' => 'Thiès'
            ],
            [
                'part_nom' => 'Association Education Sans Frontières',
                'part_pays' => 'Sénégal',
                'part_region' => 'Saint-Louis'
            ],
            [
                'part_nom' => 'Coopérative Agricole du Sénégal',
                'part_pays' => 'Sénégal',
                'part_region' => 'Kaolack'
            ],
            [
                'part_nom' => 'Entreprise Sociale Innovante',
                'part_pays' => 'Sénégal',
                'part_region' => 'Ziguinchor'
            ],
            [
                'part_nom' => 'Association des Femmes Entrepreneures',
                'part_pays' => 'Sénégal',
                'part_region' => 'Mbour'
            ],
            [
                'part_nom' => 'Fondation pour l\'Environnement',
                'part_pays' => 'Sénégal',
                'part_region' => 'Fatick'
            ],
            [
                'part_nom' => 'ONG Jeunesse Active',
                'part_pays' => 'Sénégal',
                'part_region' => 'Kolda'
            ],
            [
                'part_nom' => 'Coopérative Artisanale',
                'part_pays' => 'Sénégal',
                'part_region' => 'Tambacounda'
            ],
            [
                'part_nom' => 'Entreprise de Formation Professionnelle',
                'part_pays' => 'Sénégal',
                'part_region' => 'Kédougou'
            ]
        ];

        foreach ($partenaires as $partenaire) {
            Partenaire::create($partenaire);
        }
    }
}
