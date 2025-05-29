<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Activites;
use App\Models\Beneficiaire;
use App\Models\ActiviteBeneficiaire;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ActiviteBeneficiaireControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function authenticate(): User
    {
        $user = User::factory()->create(); // Pas de use_role ici
        $this->actingAs($user);
        return $user;
    }

    /** @test */
    public function it_lists_all_beneficiaires_of_an_activite()
    {
        $this->authenticate();

        $activite = Activites::factory()->create();
        $beneficiaires = Beneficiaire::factory()->count(3)->create();

        foreach ($beneficiaires as $beneficiaire) {
            ActiviteBeneficiaire::create([
                'acb_act_id' => $activite->act_id,
                'acb_ben_id' => $beneficiaire->ben_id,
            ]);
        }

        $response = $this->getJson("/api/activites/{$activite->act_id}/beneficiaires");

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    /** @test */
    public function it_adds_a_beneficiaire_to_an_activite()
    {
        $this->authenticate();

        $activite = Activites::factory()->create();
        $beneficiaire = Beneficiaire::factory()->create();

        $payload = [
            'ben_id' => $beneficiaire->ben_id,
        ];

        $response = $this->postJson("/api/activites/{$activite->act_id}/beneficiaires", $payload);

        $response->assertStatus(201)
                 ->assertJsonFragment(['message' => 'Bénéficiaire ajouté avec succès']);

        $this->assertDatabaseHas('activite_beneficiaire', [
            'acb_act_id' => $activite->act_id,
            'acb_ben_id' => $beneficiaire->ben_id,
        ]);
    }

    /** @test */
    public function it_rejects_duplicate_beneficiaire_in_activite()
    {
        $this->authenticate();

        $activite = Activites::factory()->create();
        $beneficiaire = Beneficiaire::factory()->create();

        ActiviteBeneficiaire::create([
            'acb_act_id' => $activite->act_id,
            'acb_ben_id' => $beneficiaire->ben_id,
        ]);

        $payload = [
            'ben_id' => $beneficiaire->ben_id,
        ];

        $response = $this->postJson("/api/activites/{$activite->act_id}/beneficiaires", $payload);

        $response->assertStatus(409)
                 ->assertJsonFragment(['message' => 'Ce bénéficiaire est déjà inscrit à cette activité']);
    }

    /** @test */
    public function it_removes_a_beneficiaire_from_an_activite()
    {
        $this->authenticate();

        $activite = Activites::factory()->create();
        $beneficiaire = Beneficiaire::factory()->create();

        ActiviteBeneficiaire::create([
            'acb_act_id' => $activite->act_id,
            'acb_ben_id' => $beneficiaire->ben_id,
        ]);

        $response = $this->deleteJson("/api/activites/{$activite->act_id}/beneficiaires/{$beneficiaire->ben_id}");

        $response->assertStatus(200)
                 ->assertJsonFragment(['message' => 'Bénéficiaire retiré avec succès']);

        $this->assertDatabaseMissing('activite_beneficiaire', [
            'acb_act_id' => $activite->act_id,
            'acb_ben_id' => $beneficiaire->ben_id,
        ]);
    }

    /** @test */
    public function it_returns_404_when_removing_non_existing_association()
    {
        $this->authenticate();

        $activite = Activites::factory()->create();
        $beneficiaire = Beneficiaire::factory()->create();

        $response = $this->deleteJson("/api/activites/{$activite->act_id}/beneficiaires/{$beneficiaire->ben_id}");

        $response->assertStatus(404)
                 ->assertJsonFragment(['message' => 'Association non trouvée']);
    }

    /** @test */
    public function it_validates_presence_of_ben_id()
    {
        $this->authenticate();

        $activite = Activites::factory()->create();

        $response = $this->postJson("/api/activites/{$activite->act_id}/beneficiaires", []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['ben_id']);
    }

    /** @test */
    public function it_add_multiple_beneficiaires_to_an_activite()
    {
        $this->authenticate();

        $activite = Activites::factory()->create();
        $b1 = Beneficiaire::factory()->create();
        $b2 = Beneficiaire::factory()->create();

        $response = $this->postJson("/api/activites/{$activite->act_id}/beneficiaires/batch", [
            'beneficiaires' => [$b1->ben_id, $b2->ben_id]
        ]);

        $response->assertStatus(201)
                ->assertJson([
                    'message' => 'Ajout effectué. 2 bénéficiaires ajoutés. 0 doublons ignorés.'
                ]);

        $this->assertDatabaseHas('activite_beneficiaire', [
            'acb_act_id' => $activite->act_id,
            'acb_ben_id' => $b1->ben_id,
        ]);

        $this->assertDatabaseHas('activite_beneficiaire', [
            'acb_act_id' => $activite->act_id,
            'acb_ben_id' => $b2->ben_id,
        ]);
    }

    /** @test */
    public function it_rejects_if_no_beneficiaires_are_provided()
    {
        $this->authenticate();
        $activite = Activites::factory()->create();

        $response = $this->postJson("/api/activites/{$activite->act_id}/beneficiaires/batch", [
            'beneficiaires' => []
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function it_rejects_if_any_beneficiaire_does_not_exist()
    {
        $this->authenticate();
        $activite = Activites::factory()->create();
        $valid = Beneficiaire::factory()->create();

        $response = $this->postJson("/api/activites/{$activite->act_id}/beneficiaires/batch", [
            'beneficiaires' => [$valid->ben_id, 99999]
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function it_ignores_duplicate_beneficiaire_entries()
    {
        $this->authenticate();
        $activite = Activites::factory()->create();
        $ben = Beneficiaire::factory()->create();

        ActiviteBeneficiaire::create([
            'acb_act_id' => $activite->act_id,
            'acb_ben_id' => $ben->ben_id,
        ]);

        $response = $this->postJson("/api/activites/{$activite->act_id}/beneficiaires/batch", [
            'beneficiaires' => [$ben->ben_id]
        ]);

        $response->assertStatus(200)
                ->assertJson([
                    'message' => 'Ajout effectué. 0 bénéficiaires ajoutés. 1 doublons ignorés.'
                ]);
    }
}
