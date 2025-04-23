<?php

namespace Database\Factories;

use App\Models\Beneficiaire;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Enums\Type;
use App\Enums\Zone;
use App\Enums\Sexe;
use App\Enums\Genre;

class BeneficiaireFactory extends Factory
{
    protected $model = Beneficiaire::class;

    public function definition(): array
    {
        return [
            'ben_prenom' => $this->faker->firstName,
            'ben_nom' => $this->faker->lastName,
            'ben_date_naissance' => $this->faker->date,
            'ben_region' => $this->faker->word,
            'ben_pays' => $this->faker->country,
            'ben_type' => Type::ENFANT->value,
            'ben_type_autre' => null,
            'ben_zone' => Zone::URBAINE->value,
            'ben_sexe' => Sexe::HOMME->value,
            'ben_sexe_autre' => null,
            'ben_genre' => Genre::CIS_HETERO->value,
            'ben_genre_autre' => null,
            'ben_ethnicite' => $this->faker->word,
        ];
    }
}
