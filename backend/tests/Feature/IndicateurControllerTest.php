<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Outcome;
use App\Models\Output;
use App\Models\Indicateur;
use Illuminate\Foundation\Testing\RefreshDatabase;

class IndicateurControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function authenticate(): User
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        return $user;
    }

    /** @test */
    public function it_lists_all_indicateurs()
    {
        $this->authenticate();
        Indicateur::factory()->count(3)->create();

        $response = $this->getJson('/api/indicateurs');

        $response->assertStatus(200)->assertJsonCount(3);
    }

    /** @test */
    public function it_filters_indicateurs_by_opu_id()
    {
        $this->authenticate();
        $output = Output::factory()->create();
        Indicateur::factory()->count(2)->create(['opu_id' => $output->opu_id]);
        Indicateur::factory()->create(); // sans opu_id

        $response = $this->getJson("/api/indicateurs?opu_id={$output->opu_id}");

        $response->assertStatus(200)->assertJsonCount(2);
    }

    /** @test */
    public function it_creates_a_valid_indicateur()
    {
        $this->authenticate();
        $data = [
            'ind_code' => 'IND-001',
            'ind_nom' => 'Test Indicateur',
            'ind_valeurCible' => 50,
        ];

        $response = $this->postJson('/api/indicateurs', $data);

        $response->assertStatus(201)->assertJsonFragment(['ind_nom' => 'Test Indicateur']);
        $this->assertDatabaseHas('indicateur', ['ind_nom' => 'Test Indicateur']);
    }

    /** @test */
    public function it_rejects_invalid_store_data()
    {
        $this->authenticate();

        $response = $this->postJson('/api/indicateurs', [
            'ind_valeurCible' => 'not-an-int',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['ind_nom', 'ind_valeurCible']);
    }

    /** @test */
    public function it_shows_a_single_indicateur()
    {
        $this->authenticate();
        $ind = Indicateur::factory()->create();

        $response = $this->getJson("/api/indicateurs/{$ind->ind_id}");

        $response->assertStatus(200)->assertJsonFragment(['ind_nom' => $ind->ind_nom]);
    }

    /** @test */
    public function it_updates_an_indicateur()
    {
        $this->authenticate();
        $ind = Indicateur::factory()->create(['ind_code' => 'OLD-CODE']);

        $response = $this->putJson("/api/indicateurs/{$ind->ind_id}", [
            'ind_code' => 'NEW-CODE',
            'ind_nom' => 'Indicateur Modifié'
        ]);

        $response->assertStatus(200)->assertJsonFragment([
            'ind_code' => 'NEW-CODE',
            'ind_nom' => 'Indicateur Modifié',
        ]);

        $this->assertDatabaseHas('indicateur', ['ind_code' => 'NEW-CODE']);
    }

    /** @test */
    public function it_rejects_invalid_update_data()
    {
        $this->authenticate();
        $ind = Indicateur::factory()->create();

        $response = $this->putJson("/api/indicateurs/{$ind->ind_id}", [
            'ind_code' => null,
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['ind_code']);
    }

    /** @test */
    public function it_deletes_an_indicateur()
    {
        $this->authenticate();
        $ind = Indicateur::factory()->create();

        $response = $this->deleteJson("/api/indicateurs/{$ind->ind_id}");

        $response->assertStatus(200)->assertJsonFragment(['message' => 'Indicateur supprimé']);
        $this->assertDatabaseMissing('indicateur', ['ind_id' => $ind->ind_id]);
    }
}
