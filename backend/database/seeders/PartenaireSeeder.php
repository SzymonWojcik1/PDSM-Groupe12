<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Partenaire;

class PartenaireSeeder extends Seeder
{
    public function run()
    {
        Partenaire::create(['part_nom' => 'Terre Solidaire', 'part_pays' => 'France', 'part_region' => 'Île-de-France']);
        Partenaire::create(['part_nom' => 'Solidaridad', 'part_pays' => 'Espagne', 'part_region' => 'Andalousie']);
        Partenaire::create(['part_nom' => 'Global Care', 'part_pays' => 'Suisse', 'part_region' => 'Vaud']);
        Partenaire::create(['part_nom' => 'MedGlobal', 'part_pays' => 'USA', 'part_region' => 'Illinois']);
        Partenaire::create(['part_nom' => 'Save Children', 'part_pays' => 'UK', 'part_region' => 'London']);
        Partenaire::create(['part_nom' => 'Humanact', 'part_pays' => 'France', 'part_region' => 'Provence']);
        Partenaire::create(['part_nom' => 'Aide Solidaire', 'part_pays' => 'Belgique', 'part_region' => 'Bruxelles']);
        Partenaire::create(['part_nom' => 'Voluntarios', 'part_pays' => 'Mexique', 'part_region' => 'CDMX']);
        Partenaire::create(['part_nom' => 'HelpenKind', 'part_pays' => 'Pays-Bas', 'part_region' => 'Utrecht']);
        Partenaire::create(['part_nom' => 'Amanecer', 'part_pays' => 'Pérou', 'part_region' => 'Lima']);
        Partenaire::create(['part_nom' => 'Manos Unidas', 'part_pays' => 'Espagne', 'part_region' => 'Madrid']);
        Partenaire::create(['part_nom' => 'CareAfrik', 'part_pays' => 'Côte d’Ivoire', 'part_region' => 'Abidjan']);
        Partenaire::create(['part_nom' => 'Sourires d’Enfants', 'part_pays' => 'France', 'part_region' => 'Lyon']);
        Partenaire::create(['part_nom' => 'Action Humana', 'part_pays' => 'Brésil', 'part_region' => 'São Paulo']);
        Partenaire::create(['part_nom' => 'RiseUp', 'part_pays' => 'Kenya', 'part_region' => 'Nairobi']);
    }
}
