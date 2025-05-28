<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Log;
use Illuminate\Foundation\Testing\RefreshDatabase;

class LogControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function authenticateAs($role, array $overrides = []): User
    {
        $user = User::factory()->create(array_merge([
            'role' => $role,
        ], $overrides));

        $this->actingAs($user);
        return $user;
    }


    /** @test */
    public function it_returns_logs_for_siege_users()
    {
        $this->authenticateAs('siege');
        Log::factory()->count(3)->create();

        $response = $this->getJson('/api/logs');

        $response->assertStatus(200)->assertJsonCount(3);
    }

    /** @test */
    public function it_denies_access_to_non_siege_users()
    {
        $roles = ['cn', 'cr'];

        foreach ($roles as $role) {
            $this->authenticateAs($role);

            $response = $this->getJson('/api/logs');
            $response->assertStatus(403)->assertJson(['message' => 'Non autorisé']);
        }
    }

    /** @test */
    public function it_denies_access_when_not_authenticated()
    {
        $response = $this->getJson('/api/logs');

        $response->assertStatus(401); // 401 = non authentifié
    }

    /** @test */
    public function logs_are_returned_in_descending_order()
    {
        $this->authenticateAs('siege');

        Log::factory()->create(['created_at' => now()->subDays(2)]);
        $logRecent = Log::factory()->create(['created_at' => now()]);

        $response = $this->getJson('/api/logs');

        $response->assertStatus(200)
                ->assertJsonPath('0.id', $logRecent->id); // le plus récent en premier
    }

    /** @test */
    public function it_returns_empty_array_if_no_logs_exist()
    {
        $this->authenticateAs('siege');

        $response = $this->getJson('/api/logs');

        $response->assertStatus(200)->assertExactJson([]);
    }

    /** @test */
    public function returned_logs_have_expected_fields()
    {
        $this->authenticateAs('siege');

        Log::factory()->create([
            'action' => 'test action',
            'level' => 'info',
            'context' => json_encode(['key' => 'value']),
        ]);

        $response = $this->getJson('/api/logs');

        $response->assertStatus(200)
                ->assertJsonStructure([[
                    'id',
                    'action',
                    'level',
                    'context',
                    'user_id',
                    'created_at',
                    'updated_at',
                ]]);
    }

}
