<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\CadreLogique;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

class CadreLogiqueControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_lists_all_cadres_logiques()
    {
        CadreLogique::factory()->count(3)->create();

        $response = $this->getJson('/api/cadre-logique');

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    /** @test */
    public function it_creates_a_valid_cadre_logique()
    {
        $payload = [
            'cad_nom' => 'Test Cadre',
            'cad_dateDebut' => '2025-05-04',
            'cad_dateFin' => '2025-05-09',
        ];

        $response = $this->postJson('/api/cadre-logique', $payload);

        $response->assertStatus(201)
                 ->assertJsonFragment(['cad_nom' => 'Test Cadre']);
    }

    /** @test */
    public function it_rejects_creation_with_missing_fields()
    {
        $response = $this->postJson('/api/cadre-logique', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['cad_nom', 'cad_dateDebut', 'cad_dateFin']);
    }

    /** @test */
    public function it_shows_a_cadre_logique()
    {
        $cadre = CadreLogique::factory()->create();

        $response = $this->getJson("/api/cadre-logique/{$cadre->cad_id}");

        $response->assertStatus(200)
                 ->assertJsonFragment(['cad_nom' => $cadre->cad_nom]);
    }

    /** @test */
    public function it_returns_404_for_non_existing_cadre_logique()
    {
        $response = $this->getJson('/api/cadre-logique/999');

        $response->assertStatus(404);
    }

    /** @test */
    public function it_updates_a_cadre_logique()
    {
        $cadre = CadreLogique::factory()->create();

        $payload = [
            'cad_nom' => 'Updated Name',
        ];

        $response = $this->putJson("/api/cadre-logique/{$cadre->cad_id}", $payload);

        $response->assertStatus(200)
                 ->assertJsonFragment(['cad_nom' => 'Updated Name']);
    }

    /** @test */
    public function it_deletes_a_cadre_logique()
    {
        $cadre = CadreLogique::factory()->create();

        $response = $this->deleteJson("/api/cadre-logique/{$cadre->cad_id}");

        $response->assertStatus(200)
                 ->assertJsonFragment(['message' => 'Cadre logique supprimé']);
    }

    /** @test */
    public function it_returns_404_when_deleting_non_existing_cadre_logique()
    {
        $response = $this->deleteJson('/api/cadre-logique/999');

        $response->assertStatus(404);
    }

    /** @test */
    public function it_rejects_overlapping_period_on_creation()
    {
        CadreLogique::factory()->create([
            'cad_dateDebut' => '2025-06-01',
            'cad_dateFin' => '2025-06-30',
        ]);

        $payload = [
            'cad_nom' => 'Chevauchement',
            'cad_dateDebut' => '2025-06-15',
            'cad_dateFin' => '2025-07-01',
        ];

        $response = $this->postJson('/api/cadre-logique', $payload);

        $response->assertStatus(409)
                ->assertJsonFragment(['message' => 'Un cadre logique existe déjà sur cette période.']);
    }

    /** @test */
    public function it_rejects_overlapping_period_on_update()
    {
        $existing = CadreLogique::factory()->create([
            'cad_dateDebut' => '2025-06-01',
            'cad_dateFin' => '2025-06-30',
        ]);

        $cadreToUpdate = CadreLogique::factory()->create([
            'cad_dateDebut' => '2025-07-01',
            'cad_dateFin' => '2025-07-15',
        ]);

        $payload = [
            'cad_dateDebut' => '2025-06-20',
            'cad_dateFin' => '2025-07-10',
        ];

        $response = $this->putJson("/api/cadre-logique/{$cadreToUpdate->cad_id}", $payload);

        $response->assertStatus(409)
                ->assertJsonFragment(['message' => 'Un autre cadre logique existe déjà sur cette période.']);
    }

}
