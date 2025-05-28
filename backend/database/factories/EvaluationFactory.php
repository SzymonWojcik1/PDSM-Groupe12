<?php

namespace Database\Factories;

use App\Models\Evaluation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class EvaluationFactory extends Factory
{
    protected $model = Evaluation::class;

    public function definition(): array
    {
        return [
            'eva_use_id' => User::factory(), // crée un user automatiquement
            'eva_statut' => $this->faker->randomElement(['en_attente', 'soumis', 'valide']),
            'eva_date_soumission' => now(),
            'criteres' => [
                ['label' => 'Compréhension des objectifs', 'reussi' => $this->faker->boolean()],
                ['label' => 'Participation active', 'reussi' => $this->faker->boolean()],
                ['label' => 'Respect des délais', 'reussi' => $this->faker->boolean()],
            ],
        ];
    }
}
