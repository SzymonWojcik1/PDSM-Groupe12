<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Activites;
use App\Models\Partenaire;
use App\Models\Projet;
use Carbon\Carbon;

class ActivitesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $activites = [
            // Activités pour le projet de développement communautaire (ID: 1)
            [
                'act_nom' => 'Formation en leadership communautaire',
                'act_dateDebut' => Carbon::now()->subMonths(11),
                'act_dateFin' => Carbon::now()->subMonths(10),
                'act_part_id' => 1,
                'act_pro_id' => 1
            ],
            [
                'act_nom' => 'Atelier de gestion de projets',
                'act_dateDebut' => Carbon::now()->subMonths(9),
                'act_dateFin' => Carbon::now()->subMonths(8),
                'act_part_id' => 1,
                'act_pro_id' => 1
            ],
            [
                'act_nom' => 'Séminaire sur la mobilisation communautaire',
                'act_dateDebut' => Carbon::now()->subMonths(7),
                'act_dateFin' => Carbon::now()->subMonths(6),
                'act_part_id' => 1,
                'act_pro_id' => 1
            ],

            // Activités pour le programme de santé rurale (ID: 2)
            [
                'act_nom' => 'Campagne de vaccination',
                'act_dateDebut' => Carbon::now()->subMonths(5),
                'act_dateFin' => Carbon::now()->subMonths(4),
                'act_part_id' => 2,
                'act_pro_id' => 2
            ],
            [
                'act_nom' => 'Formation des agents de santé communautaire',
                'act_dateDebut' => Carbon::now()->subMonths(3),
                'act_dateFin' => Carbon::now()->subMonths(2),
                'act_part_id' => 2,
                'act_pro_id' => 2
            ],
            [
                'act_nom' => 'Sensibilisation à l\'hygiène',
                'act_dateDebut' => Carbon::now()->subMonths(1),
                'act_dateFin' => Carbon::now(),
                'act_part_id' => 2,
                'act_pro_id' => 2
            ],

            // Activités pour l'initiative éducative (ID: 3)
            [
                'act_nom' => 'Formation des enseignants',
                'act_dateDebut' => Carbon::now()->addMonths(1),
                'act_dateFin' => Carbon::now()->addMonths(2),
                'act_part_id' => 3,
                'act_pro_id' => 3
            ],
            [
                'act_nom' => 'Distribution de matériel scolaire',
                'act_dateDebut' => Carbon::now()->addMonths(3),
                'act_dateFin' => Carbon::now()->addMonths(4),
                'act_part_id' => 3,
                'act_pro_id' => 3
            ],
            [
                'act_nom' => 'Programme de soutien scolaire',
                'act_dateDebut' => Carbon::now()->addMonths(5),
                'act_dateFin' => Carbon::now()->addMonths(6),
                'act_part_id' => 3,
                'act_pro_id' => 3
            ],

            // Activités pour le projet agricole (ID: 4)
            [
                'act_nom' => 'Formation en techniques agricoles durables',
                'act_dateDebut' => Carbon::now()->addMonths(7),
                'act_dateFin' => Carbon::now()->addMonths(8),
                'act_part_id' => 4,
                'act_pro_id' => 4
            ],
            [
                'act_nom' => 'Distribution de semences',
                'act_dateDebut' => Carbon::now()->addMonths(9),
                'act_dateFin' => Carbon::now()->addMonths(10),
                'act_part_id' => 4,
                'act_pro_id' => 4
            ],
            [
                'act_nom' => 'Atelier sur l\'irrigation',
                'act_dateDebut' => Carbon::now()->addMonths(11),
                'act_dateFin' => Carbon::now()->addMonths(12),
                'act_part_id' => 4,
                'act_pro_id' => 4
            ],

            // Activités pour l'innovation sociale (ID: 5)
            [
                'act_nom' => 'Formation en entrepreneuriat social',
                'act_dateDebut' => Carbon::now()->addMonths(13),
                'act_dateFin' => Carbon::now()->addMonths(14),
                'act_part_id' => 5,
                'act_pro_id' => 5
            ],
            [
                'act_nom' => 'Hackathon social',
                'act_dateDebut' => Carbon::now()->addMonths(15),
                'act_dateFin' => Carbon::now()->addMonths(16),
                'act_part_id' => 5,
                'act_pro_id' => 5
            ],
            [
                'act_nom' => 'Incubation de projets sociaux',
                'act_dateDebut' => Carbon::now()->addMonths(17),
                'act_dateFin' => Carbon::now()->addMonths(18),
                'act_part_id' => 5,
                'act_pro_id' => 5
            ],

            // Activités pour l'autonomisation des femmes (ID: 6)
            [
                'act_nom' => 'Formation en gestion d\'entreprise',
                'act_dateDebut' => Carbon::now()->addMonths(19),
                'act_dateFin' => Carbon::now()->addMonths(20),
                'act_part_id' => 6,
                'act_pro_id' => 6
            ],
            [
                'act_nom' => 'Atelier de développement personnel',
                'act_dateDebut' => Carbon::now()->addMonths(21),
                'act_dateFin' => Carbon::now()->addMonths(22),
                'act_part_id' => 6,
                'act_pro_id' => 6
            ],
            [
                'act_nom' => 'Programme de mentorat',
                'act_dateDebut' => Carbon::now()->addMonths(23),
                'act_dateFin' => Carbon::now()->addMonths(24),
                'act_part_id' => 6,
                'act_pro_id' => 6
            ],

            // Activités pour la protection de l'environnement (ID: 7)
            [
                'act_nom' => 'Campagne de reboisement',
                'act_dateDebut' => Carbon::now()->addMonths(3),
                'act_dateFin' => Carbon::now()->addMonths(4),
                'act_part_id' => 7,
                'act_pro_id' => 7
            ],
            [
                'act_nom' => 'Formation en gestion des déchets',
                'act_dateDebut' => Carbon::now()->addMonths(5),
                'act_dateFin' => Carbon::now()->addMonths(6),
                'act_part_id' => 7,
                'act_pro_id' => 7
            ],
            [
                'act_nom' => 'Sensibilisation à l\'écologie',
                'act_dateDebut' => Carbon::now()->addMonths(7),
                'act_dateFin' => Carbon::now()->addMonths(8),
                'act_part_id' => 7,
                'act_pro_id' => 7
            ],

            // Activités pour l'insertion professionnelle (ID: 8)
            [
                'act_nom' => 'Formation professionnelle',
                'act_dateDebut' => Carbon::now()->addMonths(9),
                'act_dateFin' => Carbon::now()->addMonths(10),
                'act_part_id' => 8,
                'act_pro_id' => 8
            ],
            [
                'act_nom' => 'Atelier CV et entretien',
                'act_dateDebut' => Carbon::now()->addMonths(11),
                'act_dateFin' => Carbon::now()->addMonths(12),
                'act_part_id' => 8,
                'act_pro_id' => 8
            ],
            [
                'act_nom' => 'Forum emploi jeunes',
                'act_dateDebut' => Carbon::now()->addMonths(13),
                'act_dateFin' => Carbon::now()->addMonths(14),
                'act_part_id' => 8,
                'act_pro_id' => 8
            ],

            // Activités pour l'artisanat (ID: 9)
            [
                'act_nom' => 'Formation en techniques artisanales',
                'act_dateDebut' => Carbon::now()->addMonths(15),
                'act_dateFin' => Carbon::now()->addMonths(16),
                'act_part_id' => 9,
                'act_pro_id' => 9
            ],
            [
                'act_nom' => 'Exposition artisanale',
                'act_dateDebut' => Carbon::now()->addMonths(17),
                'act_dateFin' => Carbon::now()->addMonths(18),
                'act_part_id' => 9,
                'act_pro_id' => 9
            ],
            [
                'act_nom' => 'Atelier d\'innovation artisanale',
                'act_dateDebut' => Carbon::now()->addMonths(19),
                'act_dateFin' => Carbon::now()->addMonths(20),
                'act_part_id' => 9,
                'act_pro_id' => 9
            ],

            // Activités pour la formation professionnelle (ID: 10)
            [
                'act_nom' => 'Formation en compétences numériques',
                'act_dateDebut' => Carbon::now()->addMonths(21),
                'act_dateFin' => Carbon::now()->addMonths(22),
                'act_part_id' => 10,
                'act_pro_id' => 10
            ],
            [
                'act_nom' => 'Certification professionnelle',
                'act_dateDebut' => Carbon::now()->addMonths(23),
                'act_dateFin' => Carbon::now()->addMonths(24),
                'act_part_id' => 10,
                'act_pro_id' => 10
            ],
            [
                'act_nom' => 'Stage en entreprise',
                'act_dateDebut' => Carbon::now()->addMonths(25),
                'act_dateFin' => Carbon::now()->addMonths(26),
                'act_part_id' => 10,
                'act_pro_id' => 10
            ]
        ];

        foreach ($activites as $activite) {
            Activites::create($activite);
        }
    }
}

