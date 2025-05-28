<?php

namespace Database\Factories;

use App\Models\Log;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class LogFactory extends Factory
{
    protected $model = Log::class;

    public function definition(): array
    {
        return [
            'action' => $this->faker->sentence,
            'message' => $this->faker->optional()->text(100),
            'level' => 'info',
            'context' => json_encode(['test' => true]),
            'user_id' => User::factory(),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
