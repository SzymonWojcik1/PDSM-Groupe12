<?php

namespace Database\Factories;

use App\Models\IndicateurActivite;
use App\Models\Activites;
use App\Models\Indicateur;
use Illuminate\Database\Eloquent\Factories\Factory;

class IndicateurActiviteFactory extends Factory
{
    protected $model = IndicateurActivite::class;

    public function definition(): array
    {
        return [
            'act_id' => Activites::factory(),
            'ind_id' => Indicateur::factory(),
        ];
    }
}
