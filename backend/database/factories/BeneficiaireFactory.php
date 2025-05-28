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
    // Specify the model that this factory is for
    protected $model = Beneficiaire::class;

    // Define the default state for the model
    public function definition(): array
    {
        return [
            // Generate a random first name
            'ben_prenom' => $this->faker->firstName,
            // Generate a random last name
            'ben_nom' => $this->faker->lastName,
            // Generate a random date for birth date
            'ben_date_naissance' => $this->faker->date,
            // Generate a random word for region
            'ben_region' => $this->faker->word,
            // Generate a random country
            'ben_pays' => $this->faker->country,
            // Use enum value for type
            'ben_type' => Type::ENFANT->value,
            // Set "type other" as null by default
            'ben_type_autre' => null,
            // Use enum value for zone
            'ben_zone' => Zone::URBAINE->value,
            // Use enum value for sex
            'ben_sexe' => Sexe::HOMME->value,
            // Set "sex other" as null by default
            'ben_sexe_autre' => null,
            // Use enum value for gender
            'ben_genre' => Genre::CIS_HETERO->value,
            // Set "gender other" as null by default
            'ben_genre_autre' => null,
            // Generate a random word for ethnicity
            'ben_ethnicite' => $this->faker->word,
        ];
    }
}
