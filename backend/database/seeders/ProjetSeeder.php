<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Projet;

class ProjetSeeder extends Seeder
{
    public function run()
    {
        Projet::create(['pro_nom' => 'Éducation rurale', 'pro_dateDebut' => '2023-01-15', 'pro_dateFin' => '2023-12-30', 'pro_part_id' => 1]);
        Projet::create(['pro_nom' => 'Santé pour tous', 'pro_dateDebut' => '2022-06-01', 'pro_dateFin' => '2023-06-01', 'pro_part_id' => 2]);
        Projet::create(['pro_nom' => 'Accès à l’eau', 'pro_dateDebut' => '2023-03-10', 'pro_dateFin' => '2023-10-20', 'pro_part_id' => 3]);
        Projet::create(['pro_nom' => 'Nutrition infantile', 'pro_dateDebut' => '2024-01-01', 'pro_dateFin' => '2024-11-30', 'pro_part_id' => 4]);
        Projet::create(['pro_nom' => 'Insertion pro', 'pro_dateDebut' => '2023-05-01', 'pro_dateFin' => '2024-05-01', 'pro_part_id' => 5]);
        Projet::create(['pro_nom' => 'Soutien psychosocial', 'pro_dateDebut' => '2023-02-20', 'pro_dateFin' => '2023-12-01', 'pro_part_id' => 6]);
        Projet::create(['pro_nom' => 'Agriculture durable', 'pro_dateDebut' => '2023-04-15', 'pro_dateFin' => '2023-09-30', 'pro_part_id' => 7]);
        Projet::create(['pro_nom' => 'Aide post-crise', 'pro_dateDebut' => '2023-07-01', 'pro_dateFin' => '2024-02-01', 'pro_part_id' => 8]);
        Projet::create(['pro_nom' => 'Lutte contre le VIH', 'pro_dateDebut' => '2022-11-10', 'pro_dateFin' => '2023-11-10', 'pro_part_id' => 9]);
        Projet::create(['pro_nom' => 'Formation numérique', 'pro_dateDebut' => '2023-06-15', 'pro_dateFin' => '2023-12-15', 'pro_part_id' => 10]);
        Projet::create(['pro_nom' => 'Développement local', 'pro_dateDebut' => '2024-01-10', 'pro_dateFin' => '2024-12-10', 'pro_part_id' => 11]);
        Projet::create(['pro_nom' => 'Microcrédit rural', 'pro_dateDebut' => '2023-09-01', 'pro_dateFin' => '2024-09-01', 'pro_part_id' => 12]);
        Projet::create(['pro_nom' => 'Protection enfants', 'pro_dateDebut' => '2023-03-01', 'pro_dateFin' => '2023-12-01', 'pro_part_id' => 13]);
        Projet::create(['pro_nom' => 'Centre communautaire', 'pro_dateDebut' => '2023-05-01', 'pro_dateFin' => '2024-03-01', 'pro_part_id' => 14]);
        Projet::create(['pro_nom' => 'Aide juridique', 'pro_dateDebut' => '2022-12-01', 'pro_dateFin' => '2023-12-01', 'pro_part_id' => 15]);
    }
}
