<?php

namespace Database\Factories;

use App\Models\CadreLogique;
use Illuminate\Database\Eloquent\Factories\Factory;

class CadreLogiqueFactory extends Factory
{
    protected $model = CadreLogique::class;

    public function definition(): array
    {
        $debut = $this->faker->dateTimeBetween('+1 days', '+1 month');
        $fin = (clone $debut)->modify('+5 days');

        return [
            'cad_nom' => $this->faker->words(3, true),
            'cad_dateDebut' => $debut->format('Y-m-d'),
            'cad_dateFin' => $fin->format('Y-m-d'),
        ];
    }
}
