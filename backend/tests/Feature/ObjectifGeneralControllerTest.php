<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\CadreLogique;
use App\Models\ObjectifGeneral;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ObjectifGeneralControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function authenticate(): void
    {
        $user = User::factory()->create(['role' => 'siege']);
        $this->actingAs($user);
    }

    /** @test */
    public function it_lists_all_objectifs_generaux()
    {
        $this->authenticate();
        ObjectifGeneral::factory()->count(3)->create();

        $response = $this->getJson('/api/objectifs-generaux');

        $response->assertStatus(200)->assertJsonCount(3);
    }

    /** @test */
    public function it_creates_a_valid_objectif_general()
    {
        $this->authenticate();
        $cadre = CadreLogique::factory()->create();

        $payload = [
            'obj_nom' => 'Nouvel Objectif',
            'cad_id' => $cadre->cad_id,
        ];

        $response = $this->postJson('/api/objectifs-generaux', $payload);

        $response->assertStatus(201)->assertJsonFragment(['obj_nom' => 'Nouvel Objectif']);
    }

    /** @test */
    public function it_rejects_creation_with_missing_fields()
    {
        $this->authenticate();
        $response = $this->postJson('/api/objectifs-generaux', []);

        $response->assertStatus(422)->assertJsonValidationErrors(['obj_nom', 'cad_id']);
    }

    /** @test */
    public function it_shows_an_objectif_general()
    {
        $this->authenticate();
        $objectif = ObjectifGeneral::factory()->create();

        $response = $this->getJson("/api/objectifs-generaux/{$objectif->obj_id}");

        $response->assertStatus(200)->assertJsonFragment(['obj_nom' => $objectif->obj_nom]);
    }

    /** @test */
    public function it_returns_404_for_non_existing_objectif_general()
    {
        $this->authenticate();
        $response = $this->getJson('/api/objectifs-generaux/999');

        $response->assertStatus(404);
    }

    /** @test */
    public function it_updates_an_objectif_general()
    {
        $this->authenticate();
        $objectif = ObjectifGeneral::factory()->create();

        $payload = ['obj_nom' => 'Objectif Mis à Jour'];

        $response = $this->putJson("/api/objectifs-generaux/{$objectif->obj_id}", $payload);

        $response->assertStatus(200)->assertJsonFragment(['obj_nom' => 'Objectif Mis à Jour']);
    }

    /** @test */
    public function it_deletes_an_objectif_general()
    {
        $this->authenticate();
        $objectif = ObjectifGeneral::factory()->create();

        $response = $this->deleteJson("/api/objectifs-generaux/{$objectif->obj_id}");

        $response->assertStatus(200)->assertJsonFragment(['message' => 'Objectif général supprimé']);
    }

    /** @test */
    public function it_returns_404_when_deleting_non_existing_objectif_general()
    {
        $this->authenticate();
        $response = $this->deleteJson('/api/objectifs-generaux/999');

        $response->assertStatus(404);
    }

    /** @test */
    public function it_rejects_creation_with_invalid_cad_id()
    {
        $this->authenticate();
        $payload = [
            'obj_nom' => 'Invalid Cadre',
            'cad_id' => 999,
        ];

        $response = $this->postJson('/api/objectifs-generaux', $payload);

        $response->assertStatus(422)->assertJsonValidationErrors(['cad_id']);
    }

    /** @test */
    public function it_rejects_update_with_invalid_cad_id()
    {
        $this->authenticate();
        $objectif = ObjectifGeneral::factory()->create();

        $payload = ['cad_id' => 999];

        $response = $this->putJson("/api/objectifs-generaux/{$objectif->obj_id}", $payload);

        $response->assertStatus(422)->assertJsonValidationErrors(['cad_id']);
    }

    /** @test */
    public function it_updates_only_obj_nom()
    {
        $this->authenticate();
        $objectif = ObjectifGeneral::factory()->create();

        $payload = ['obj_nom' => 'Nouveau Nom'];

        $response = $this->putJson("/api/objectifs-generaux/{$objectif->obj_id}", $payload);

        $response->assertStatus(200)->assertJsonFragment(['obj_nom' => 'Nouveau Nom']);
    }

    /** @test */
    public function it_rejects_update_with_empty_obj_nom()
    {
        $this->authenticate();
        $objectif = ObjectifGeneral::factory()->create();

        $payload = ['obj_nom' => ''];

        $response = $this->putJson("/api/objectifs-generaux/{$objectif->obj_id}", $payload);

        $response->assertStatus(422)->assertJsonValidationErrors(['obj_nom']);
    }
}
