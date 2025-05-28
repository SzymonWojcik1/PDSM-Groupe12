<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Outcome;
use App\Models\Output;
use Illuminate\Foundation\Testing\RefreshDatabase;

class OutputControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function authenticate(): User
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        return $user;
    }

    /** @test */
    public function it_lists_all_outputs()
    {
        $this->authenticate();

        Output::factory()->count(3)->create();

        $response = $this->getJson('/api/outputs');

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    /** @test */
    public function it_creates_a_valid_output()
    {
        $this->authenticate();

        $outcome = Outcome::factory()->create();

        $payload = [
            'opu_nom' => 'Nouvel Output',
            'opu_code' => 'OP001',
            'out_id' => $outcome->out_id,
        ];

        $response = $this->postJson('/api/outputs', $payload);

        $response->assertStatus(201)
                 ->assertJsonFragment(['opu_nom' => 'Nouvel Output']);
    }

    /** @test */
    public function it_rejects_creation_with_missing_fields()
    {
        $this->authenticate();

        $response = $this->postJson('/api/outputs', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['opu_nom', 'opu_code', 'out_id']);
    }

    /** @test */
    public function it_shows_an_output()
    {
        $this->authenticate();

        $output = Output::factory()->create();

        $response = $this->getJson("/api/outputs/{$output->opu_id}");

        $response->assertStatus(200)
                 ->assertJsonFragment(['opu_nom' => $output->opu_nom]);
    }

    /** @test */
    public function it_returns_404_for_non_existing_output()
    {
        $this->authenticate();

        $response = $this->getJson('/api/outputs/999');

        $response->assertStatus(404);
    }

    /** @test */
    public function it_updates_an_output()
    {
        $this->authenticate();

        $output = Output::factory()->create();

        $payload = [
            'opu_nom' => 'Output Mis à Jour',
        ];

        $response = $this->putJson("/api/outputs/{$output->opu_id}", $payload);

        $response->assertStatus(200)
                 ->assertJsonFragment(['opu_nom' => 'Output Mis à Jour']);
    }

    /** @test */
    public function it_deletes_an_output()
    {
        $this->authenticate();

        $output = Output::factory()->create();

        $response = $this->deleteJson("/api/outputs/{$output->opu_id}");

        $response->assertStatus(200)
                 ->assertJsonFragment(['message' => 'Output supprimé']);
    }

    /** @test */
    public function it_returns_404_when_deleting_non_existing_output()
    {
        $this->authenticate();

        $response = $this->deleteJson('/api/outputs/999');

        $response->assertStatus(404);
    }

    /** @test */
    public function it_rejects_creation_with_invalid_out_id()
    {
        $this->authenticate();

        $payload = [
            'opu_nom' => 'Invalid Outcome',
            'opu_code' => 'BAD001',
            'out_id' => 999,
        ];

        $response = $this->postJson('/api/outputs', $payload);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['out_id']);
    }

    /** @test */
    public function it_rejects_update_with_invalid_out_id()
    {
        $this->authenticate();

        $output = Output::factory()->create();

        $payload = [
            'out_id' => 999,
        ];

        $response = $this->putJson("/api/outputs/{$output->opu_id}", $payload);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['out_id']);
    }

    /** @test */
    public function it_rejects_update_with_long_opu_code()
    {
        $this->authenticate();

        $output = Output::factory()->create();

        $payload = [
            'opu_code' => str_repeat('A', 25),
        ];

        $response = $this->putJson("/api/outputs/{$output->opu_id}", $payload);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['opu_code']);
    }
}
