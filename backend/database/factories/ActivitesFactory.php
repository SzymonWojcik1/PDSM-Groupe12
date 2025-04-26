<?php

namespace Database\Factories;

use App\Models\Activites;
use App\Models\Partenaire;
use App\Models\Projet;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ActivitesFactory extends Factory
{
    protected $model = Activites::class;

    public function definition(): array
    {
        $startDate = Carbon::now()->addDays(rand(1, 30));
        $endDate = (clone $startDate)->addDays(rand(1, 10));

        return [
            'act_nom' => $this->faker->sentence(3),
            'act_dateDebut' => $startDate->format('Y-m-d'),
            'act_dateFin' => $endDate->format('Y-m-d'),
            'act_part_id' => Partenaire::factory(), 
            'act_pro_id' => Projet::factory(),    
        ];
    }
}
