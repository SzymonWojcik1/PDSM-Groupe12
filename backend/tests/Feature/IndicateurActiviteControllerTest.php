<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Activites;
use App\Models\Indicateur;
use App\Models\IndicateurActivite;
use App\Models\Beneficiaire;
use Illuminate\Foundation\Testing\RefreshDatabase;

class IndicateurActiviteControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function authenticate(): User
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        return $user;
    }

    /** @test */
    public function it_lists_all_links()
    {
        $this->authenticate();

        IndicateurActivite::factory()->count(2)->create();

        $response = $this->getJson('/api/indicateur-activite');

        $response->assertStatus(200)
                 ->assertJsonCount(2);
    }

    /** @test */
    public function it_creates_a_link_between_indicateur_and_activite()
    {
        $this->authenticate();

        $activite = Activites::factory()->create();
        $indicateur = Indicateur::factory()->create();

        $response = $this->postJson('/api/indicateur-activite', [
            'act_id' => $activite->act_id,
            'ind_id' => $indicateur->ind_id,
        ]);

        $response->assertStatus(201)
                 ->assertJsonFragment([
                     'act_id' => $activite->act_id,
                     'ind_id' => $indicateur->ind_id,
                 ]);

        $this->assertDatabaseHas('activite_indicateur', [
            'act_id' => $activite->act_id,
            'ind_id' => $indicateur->ind_id,
        ]);
    }

    /** @test */
    public function it_validates_invalid_data_on_store()
    {
        $this->authenticate();

        $response = $this->postJson('/api/indicateur-activite', [
            'act_id' => 999,
            'ind_id' => null,
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['act_id', 'ind_id']);
    }

    /** @test */
    public function it_shows_a_link()
    {
        $this->authenticate();

        $link = IndicateurActivite::factory()->create();

        $response = $this->getJson("/api/indicateur-activite/{$link->id}");

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'act_id' => $link->act_id,
                     'ind_id' => $link->ind_id,
                 ]);
    }

    /** @test */
    public function it_deletes_a_link()
    {
        $this->authenticate();

        $link = IndicateurActivite::factory()->create();

        $response = $this->deleteJson("/api/indicateur-activite/{$link->id}");

        $response->assertStatus(200)
                 ->assertJsonFragment(['message' => 'Lien supprimé avec succès']);

        $this->assertDatabaseMissing('activite_indicateur', ['id' => $link->id]);
    }

    /** @test */
    public function it_returns_activities_with_beneficiaire_count()
    {
        $this->authenticate();

        $activite = Activites::factory()->create();
        $indicateur = Indicateur::factory()->create();
        IndicateurActivite::create(['act_id' => $activite->act_id, 'ind_id' => $indicateur->ind_id]);

        $beneficiaire = Beneficiaire::factory()->create();
        $activite->beneficiaires()->attach($beneficiaire->ben_id);

        $response = $this->getJson("/api/indicateur-activite/{$indicateur->ind_id}/activites-with-count");

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'act_id' => $activite->act_id,
                     'nbBeneficiaires' => 1,
                 ]);
    }

    /** @test */
    public function it_stores_multiple_links_without_duplicates()
    {
        $this->authenticate();

        $indicateur = Indicateur::factory()->create();
        $acts = Activites::factory()->count(3)->create();

        IndicateurActivite::create(['act_id' => $acts[0]->act_id, 'ind_id' => $indicateur->ind_id]);

        $actIds = $acts->pluck('act_id')->toArray();

        $response = $this->postJson('/api/indicateur-activite/batch', [
            'ind_id' => $indicateur->ind_id,
            'act_ids' => $actIds,
        ]);

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'message' => 'Activités liées avec succès',
                     'count' => 2,
                 ]);
    }
}
