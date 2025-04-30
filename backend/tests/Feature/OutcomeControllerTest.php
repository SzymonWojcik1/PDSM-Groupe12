<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\ObjectifGeneral;
use App\Models\Outcome;
use Illuminate\Foundation\Testing\RefreshDatabase;

class OutcomeControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_lists_all_outcomes()
    {
        Outcome::factory()->count(3)->create();

        $response = $this->getJson('/api/outcomes');

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    /** @test */
    public function it_creates_a_valid_outcome()
    {
        $objectif = ObjectifGeneral::factory()->create();

        $payload = [
            'out_nom' => 'Nouvel Outcome',
            'obj_id' => $objectif->obj_id,
        ];

        $response = $this->postJson('/api/outcomes', $payload);

        $response->assertStatus(201)
                 ->assertJsonFragment(['out_nom' => 'Nouvel Outcome']);
    }

    /** @test */
    public function it_rejects_creation_with_missing_fields()
    {
        $response = $this->postJson('/api/outcomes', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['out_nom', 'obj_id']);
    }

    /** @test */
    public function it_shows_an_outcome()
    {
        $outcome = Outcome::factory()->create();

        $response = $this->getJson("/api/outcomes/{$outcome->out_id}");

        $response->assertStatus(200)
                 ->assertJsonFragment(['out_nom' => $outcome->out_nom]);
    }

    /** @test */
    public function it_returns_404_for_non_existing_outcome()
    {
        $response = $this->getJson('/api/outcomes/999');

        $response->assertStatus(404);
    }

    /** @test */
    public function it_updates_an_outcome()
    {
        $outcome = Outcome::factory()->create();

        $payload = [
            'out_nom' => 'Outcome Mis à Jour',
        ];

        $response = $this->putJson("/api/outcomes/{$outcome->out_id}", $payload);

        $response->assertStatus(200)
                 ->assertJsonFragment(['out_nom' => 'Outcome Mis à Jour']);
    }

    /** @test */
    public function it_deletes_an_outcome()
    {
        $outcome = Outcome::factory()->create();

        $response = $this->deleteJson("/api/outcomes/{$outcome->out_id}");

        $response->assertStatus(200)
                 ->assertJsonFragment(['message' => 'Outcome supprimé']);
    }

    /** @test */
    public function it_returns_404_when_deleting_non_existing_outcome()
    {
        $response = $this->deleteJson('/api/outcomes/999');

        $response->assertStatus(404);
    }

    /** @test */
    public function it_rejects_creation_with_invalid_obj_id()
    {
        $payload = [
            'out_nom' => 'Invalid Objectif',
            'obj_id' => 999,
        ];

        $response = $this->postJson('/api/outcomes', $payload);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['obj_id']);
    }

    /** @test */
    public function it_rejects_update_with_invalid_obj_id()
    {
        $outcome = Outcome::factory()->create();

        $payload = [
            'obj_id' => 999,
        ];

        $response = $this->putJson("/api/outcomes/{$outcome->out_id}", $payload);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['obj_id']);
    }

    /** @test */
    public function it_updates_only_out_nom()
    {
        $outcome = Outcome::factory()->create();

        $payload = [
            'out_nom' => 'Nom uniquement changé',
        ];

        $response = $this->putJson("/api/outcomes/{$outcome->out_id}", $payload);

        $response->assertStatus(200)
                 ->assertJsonFragment(['out_nom' => 'Nom uniquement changé']);
    }

    /** @test */
    public function it_rejects_update_with_empty_out_nom()
    {
        $outcome = Outcome::factory()->create();

        $payload = [
            'out_nom' => '',
        ];

        $response = $this->putJson("/api/outcomes/{$outcome->out_id}", $payload);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['out_nom']);
    }
}
