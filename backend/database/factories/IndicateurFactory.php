<?php

namespace Database\Factories;

use App\Models\Indicateur;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\OutCome;
use App\Models\Output;

class IndicateurFactory extends Factory
{
    protected $model = Indicateur::class;

    public function definition(): array
    {
        return [
            'ind_code' => strtoupper($this->faker->unique()->bothify('IND-###')),
            'ind_nom' => $this->faker->sentence(3),
            'ind_valeurCible' => $this->faker->numberBetween(10, 100),
            'out_id' => OutCome::factory()->create()->out_id, 
            'opu_id' => Output::factory()->create()->opu_id,
        ];
    }
}
