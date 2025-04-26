<?php

namespace Database\Factories;

use App\Models\Projet;
use App\Models\Partenaire;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

class ProjetFactory extends Factory
{
    protected $model = Projet::class;

    public function definition(): array
    {
        $startDate = Carbon::now()->addDays(rand(1, 30));
        $endDate = (clone $startDate)->addDays(rand(1, 60));

        return [
            'pro_nom' => $this->faker->catchPhrase,
            'pro_dateDebut' => $startDate->format('Y-m-d'),
            'pro_dateFin' => $endDate->format('Y-m-d'),
            'pro_part_id' => Partenaire::factory(), // on crée un partenaire automatiquement
        ];
    }
}
