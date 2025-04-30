<?php

namespace Database\Factories;

use App\Models\ObjectifGeneral;
use App\Models\CadreLogique;
use Illuminate\Database\Eloquent\Factories\Factory;

class ObjectifGeneralFactory extends Factory
{
    protected $model = ObjectifGeneral::class;

    public function definition(): array
    {
        return [
            'obj_nom' => $this->faker->sentence(3),
            'cad_id' => CadreLogique::factory(),
        ];
    }
}
