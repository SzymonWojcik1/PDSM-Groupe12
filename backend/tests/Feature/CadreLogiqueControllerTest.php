<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\CadreLogique;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CadreLogiqueControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function authenticate(): User
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        return $user;
    }

    /** @test */
    public function it_lists_all_cadres_logiques()
    {
        $this->authenticate();

        CadreLogique::factory()->count(3)->create();

        $response = $this->getJson('/api/cadre-logique');

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    /** @test */
    public function it_creates_a_valid_cadre_logique()
    {
        $this->authenticate();

        $payload = [
            'cad_nom' => 'Cadre 1',
            'cad_dateDebut' => '2025-01-01',
            'cad_dateFin' => '2025-12-31',
        ];

        $response = $this->postJson('/api/cadre-logique', $payload);

        $response->assertStatus(201)
                 ->assertJsonFragment(['cad_nom' => 'Cadre 1']);

        $this->assertDatabaseHas('cadre_logique', ['cad_nom' => 'Cadre 1']);
    }

    /** @test */
    public function it_rejects_creation_with_missing_fields()
    {
        $this->authenticate();

        $response = $this->postJson('/api/cadre-logique', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['cad_nom', 'cad_dateDebut', 'cad_dateFin']);
    }

    /** @test */
    public function it_rejects_overlapping_period_on_creation()
    {
        $this->authenticate();

        CadreLogique::create([
            'cad_nom' => 'Ancien Cadre',
            'cad_dateDebut' => '2025-01-01',
            'cad_dateFin' => '2025-12-31',
        ]);

        $payload = [
            'cad_nom' => 'Nouveau Cadre',
            'cad_dateDebut' => '2025-06-01',
            'cad_dateFin' => '2025-08-31',
        ];

        $response = $this->postJson('/api/cadre-logique', $payload);

        $response->assertStatus(409)
                 ->assertJsonFragment(['message' => 'Un cadre logique existe déjà sur cette période.']);
    }

    /** @test */
    public function it_shows_a_cadre_logique()
    {
        $this->authenticate();

        $cadre = CadreLogique::factory()->create();

        $response = $this->getJson("/api/cadre-logique/{$cadre->cad_id}");

        $response->assertStatus(200)
                 ->assertJsonFragment(['cad_id' => $cadre->cad_id]);
    }

    /** @test */
    public function it_returns_404_for_non_existing_cadre_logique()
    {
        $this->authenticate();

        $response = $this->getJson("/api/cadre-logique/999");

        $response->assertStatus(404);
    }

    /** @test */
    public function it_updates_a_cadre_logique()
    {
        $this->authenticate();

        $cadre = CadreLogique::factory()->create([
            'cad_nom' => 'Initial',
        ]);

        $response = $this->putJson("/api/cadre-logique/{$cadre->cad_id}", [
            'cad_nom' => 'Modifié',
        ]);

        $response->assertStatus(200)
                 ->assertJsonFragment(['cad_nom' => 'Modifié']);

        $this->assertDatabaseHas('cadre_logique', ['cad_id' => $cadre->cad_id, 'cad_nom' => 'Modifié']);
    }

    /** @test */
    public function it_rejects_overlapping_period_on_update()
    {
        $this->authenticate();

        CadreLogique::create([
            'cad_nom' => 'Cadre A',
            'cad_dateDebut' => '2025-01-01',
            'cad_dateFin' => '2025-12-31',
        ]);

        $cadreB = CadreLogique::create([
            'cad_nom' => 'Cadre B',
            'cad_dateDebut' => '2026-01-01',
            'cad_dateFin' => '2026-12-31',
        ]);

        $response = $this->putJson("/api/cadre-logique/{$cadreB->cad_id}", [
            'cad_dateDebut' => '2025-05-01',
            'cad_dateFin' => '2025-06-01',
        ]);

        $response->assertStatus(409)
                 ->assertJsonFragment(['message' => 'Un autre cadre logique existe déjà sur cette période.']);
    }

    /** @test */
    public function it_deletes_a_cadre_logique()
    {
        $this->authenticate();

        $cadre = CadreLogique::factory()->create();

        $response = $this->deleteJson("/api/cadre-logique/{$cadre->cad_id}");

        $response->assertStatus(200)
                 ->assertJsonFragment(['message' => 'Cadre logique supprimé']);

        $this->assertDatabaseMissing('cadre_logique', ['cad_id' => $cadre->cad_id]);
    }

    /** @test */
    public function it_returns_404_when_deleting_non_existing_cadre_logique()
    {
        $this->authenticate();

        $response = $this->deleteJson("/api/cadre-logique/999");

        $response->assertStatus(404);
    }
}
