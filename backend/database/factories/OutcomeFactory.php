<?php

namespace Database\Factories;

use App\Models\Outcome;
use App\Models\ObjectifGeneral;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Outcome>
 */
class OutcomeFactory extends Factory
{
    protected $model = Outcome::class;

    public function definition(): array
    {
        return [
            'out_nom' => $this->faker->sentence(3),
            'obj_id' => ObjectifGeneral::factory(),
            'out_code' => strtoupper($this->faker->bothify('OUT-###')), // <-- AJOUT ICI
        ];
    }
}
