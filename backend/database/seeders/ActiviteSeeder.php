<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Activites;

class ActiviteSeeder extends Seeder
{
    public function run()
    {
        Activites::create(['act_nom' => 'Atelier couture', 'act_dateDebut' => '2023-02-01', 'act_dateFin' => '2023-02-15', 'act_part_id' => 1, 'act_pro_id' => 1]);
        Activites::create(['act_nom' => 'Campagne santé', 'act_dateDebut' => '2023-03-01', 'act_dateFin' => '2023-03-20', 'act_part_id' => 2, 'act_pro_id' => 2]);
        Activites::create(['act_nom' => 'Forage puits', 'act_dateDebut' => '2023-04-10', 'act_dateFin' => '2023-04-25', 'act_part_id' => 3, 'act_pro_id' => 3]);
        Activites::create(['act_nom' => 'Consultations mobiles', 'act_dateDebut' => '2023-01-10', 'act_dateFin' => '2023-01-20', 'act_part_id' => 4, 'act_pro_id' => 4]);
        Activites::create(['act_nom' => 'Session CV', 'act_dateDebut' => '2023-06-01', 'act_dateFin' => '2023-06-10', 'act_part_id' => 5, 'act_pro_id' => 5]);
        Activites::create(['act_nom' => 'Thérapie enfants', 'act_dateDebut' => '2023-07-05', 'act_dateFin' => '2023-07-20', 'act_part_id' => 6, 'act_pro_id' => 6]);
        Activites::create(['act_nom' => 'Atelier compost', 'act_dateDebut' => '2023-08-01', 'act_dateFin' => '2023-08-10', 'act_part_id' => 7, 'act_pro_id' => 7]);
        Activites::create(['act_nom' => 'Réhabilitation école', 'act_dateDebut' => '2023-09-15', 'act_dateFin' => '2023-09-30', 'act_part_id' => 8, 'act_pro_id' => 8]);
        Activites::create(['act_nom' => 'Dépistage VIH', 'act_dateDebut' => '2023-10-01', 'act_dateFin' => '2023-10-15', 'act_part_id' => 9, 'act_pro_id' => 9]);
        Activites::create(['act_nom' => 'Formation web', 'act_dateDebut' => '2023-11-01', 'act_dateFin' => '2023-11-20', 'act_part_id' => 10, 'act_pro_id' => 10]);
        Activites::create(['act_nom' => 'Journée village', 'act_dateDebut' => '2023-12-01', 'act_dateFin' => '2023-12-01', 'act_part_id' => 11, 'act_pro_id' => 11]);
        Activites::create(['act_nom' => 'Rencontre femmes', 'act_dateDebut' => '2023-03-08', 'act_dateFin' => '2023-03-08', 'act_part_id' => 12, 'act_pro_id' => 12]);
        Activites::create(['act_nom' => 'Spectacle enfants', 'act_dateDebut' => '2023-05-20', 'act_dateFin' => '2023-05-20', 'act_part_id' => 13, 'act_pro_id' => 13]);
        Activites::create(['act_nom' => 'Fête communautaire', 'act_dateDebut' => '2023-06-15', 'act_dateFin' => '2023-06-15', 'act_part_id' => 14, 'act_pro_id' => 14]);
        Activites::create(['act_nom' => 'Séance d’info droit', 'act_dateDebut' => '2023-07-01', 'act_dateFin' => '2023-07-01', 'act_part_id' => 15, 'act_pro_id' => 15]);
    }
}
