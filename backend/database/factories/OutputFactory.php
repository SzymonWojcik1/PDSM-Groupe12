<?php

namespace Database\Factories;

use App\Models\Outcome;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Output>
 */
class OutputFactory extends Factory
{
    public function definition(): array
    {
        return [
            'opu_nom' => $this->faker->sentence(3),
            'opu_code' => strtoupper($this->faker->bothify('OUT-###')),
            'out_id' => Outcome::factory(), // Génère automatiquement un outcome lié
        ];
    }
}
