<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Activites;
use App\Models\Beneficiaire;
use App\Models\ActiviteBeneficiaire;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ActiviteBeneficiaireControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_lists_all_beneficiaires_of_an_activite()
    {
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
        $activite = Activites::factory()->create();
        $beneficiaire = Beneficiaire::factory()->create();

        $payload = [
            'ben_id' => $beneficiaire->ben_id,
        ];

        $response = $this->postJson("/api/activites/{$activite->act_id}/beneficiaires", $payload);

        $response->assertStatus(201)
                 ->assertJsonFragment(['message' => 'Bénéficiaire ajouté avec succès']);
    }

    /** @test */
    public function it_rejects_duplicate_beneficiaire_in_activite()
    {
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
        $activite = Activites::factory()->create();
        $beneficiaire = Beneficiaire::factory()->create();

        ActiviteBeneficiaire::create([
            'acb_act_id' => $activite->act_id,
            'acb_ben_id' => $beneficiaire->ben_id,
        ]);

        $response = $this->deleteJson("/api/activites/{$activite->act_id}/beneficiaires/{$beneficiaire->ben_id}");

        $response->assertStatus(200)
                 ->assertJsonFragment(['message' => 'Bénéficiaire retiré avec succès']);
    }

    /** @test */
    public function it_returns_404_when_removing_non_existing_association()
    {
        $activite = Activites::factory()->create();
        $beneficiaire = Beneficiaire::factory()->create();

        $response = $this->deleteJson("/api/activites/{$activite->act_id}/beneficiaires/{$beneficiaire->ben_id}");

        $response->assertStatus(404)
                 ->assertJsonFragment(['message' => 'Association non trouvée']);
    }
}
