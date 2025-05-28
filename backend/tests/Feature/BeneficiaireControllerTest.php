<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Beneficiaire;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Enums\Type;
use App\Enums\Zone;
use App\Enums\Sexe;
use App\Enums\Genre;

class BeneficiaireControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_creates_a_valid_beneficiaire()
    {
        // Create a valid beneficiary and test creation endpoint
        $data = Beneficiaire::factory()->make([
            'ben_type' => 'child',
            'ben_date_naissance' => now()->subYears(10)->format('Y-m-d'),
        ])->toArray();

        $response = $this->postJson('/api/beneficiaires', $data);

        $response->assertStatus(201)
                ->assertJsonFragment(['ben_nom' => $data['ben_nom']]);

        $this->assertDatabaseHas('beneficiaires', [
            'ben_nom' => $data['ben_nom'],
        ]);
    }

    /** @test */
    public function it_rejects_missing_required_fields()
    {
        // Test validation: missing required fields
        $data = Beneficiaire::factory()->make([
            'ben_nom' => null,
            'ben_type' => 'child',
            'ben_date_naissance' => now()->subYears(10)->format('Y-m-d'),
        ])->toArray();

        $response = $this->postJson('/api/beneficiaires', $data);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['ben_nom']);
    }

    /** @test */
    public function it_rejects_type_autre_without_type_autre()
    {
        // Test validation: type "other" requires ben_type_autre
        $response = $this->postJson('/api/beneficiaires', [
            'ben_prenom' => 'Test',
            'ben_nom' => 'User',
            'ben_date_naissance' => '2000-01-01',
            'ben_region' => 'R1',
            'ben_pays' => 'P1',
            'ben_type' => 'other',
            'ben_type_autre' => null,
            'ben_zone' => 'urban',
            'ben_sexe' => 'male',
            'ben_sexe_autre' => null,
            'ben_genre' => 'cis_hetero',
            'ben_genre_autre' => null,
            'ben_ethnicite' => 'ethnie'
        ]);

        $response->assertStatus(422)
                 ->assertJsonFragment(['ben_type_autre' => 'Champ requis si type est "Autre"']);
    }

    /** @test */
    public function it_rejects_sexe_autre_without_sexe_autre()
    {
        // Test validation: sexe "other" requires ben_sexe_autre
        $response = $this->postJson('/api/beneficiaires', [
            'ben_prenom' => 'Test',
            'ben_nom' => 'User',
            'ben_date_naissance' => '2000-01-01',
            'ben_region' => 'R1',
            'ben_pays' => 'P1',
            'ben_type' => 'child',
            'ben_type_autre' => null,
            'ben_zone' => 'urban',
            'ben_sexe' => 'other',
            'ben_sexe_autre' => null,
            'ben_genre' => 'cis_hetero',
            'ben_genre_autre' => null,
            'ben_ethnicite' => 'ethnie'
        ]);

        $response->assertStatus(422)
                 ->assertJsonFragment(['ben_sexe_autre' => 'Champ requis si sexe est "Autre"']);
    }

    /** @test */
    public function it_rejects_genre_autre_without_genre_autre()
    {
        // Test validation: genre "other" requires ben_genre_autre
        $response = $this->postJson('/api/beneficiaires', [
            'ben_prenom' => 'Test',
            'ben_nom' => 'User',
            'ben_date_naissance' => '2000-01-01',
            'ben_region' => 'R1',
            'ben_pays' => 'P1',
            'ben_type' => 'child',
            'ben_type_autre' => null,
            'ben_zone' => 'urban',
            'ben_sexe' => 'male',
            'ben_sexe_autre' => null,
            'ben_genre' => 'other',
            'ben_genre_autre' => null,
            'ben_ethnicite' => 'ethnie'
        ]);

        $response->assertStatus(422)
                 ->assertJsonFragment(['ben_genre_autre' => 'Champ requis si genre est "Autre"']);
    }

    /** @test */
    public function it_lists_all_beneficiaires()
    {
        // Test listing all beneficiaries
        Beneficiaire::factory()->count(3)->create([
            'ben_type' => 'child',
            'ben_date_naissance' => now()->subYears(10)->format('Y-m-d'),
        ]);

        $response = $this->getJson('/api/beneficiaires');

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    /** @test */
    public function it_filters_beneficiaires_by_fields()
    {
        // Test filtering beneficiaries by zone and sex
        Beneficiaire::factory()->create([
            'ben_zone' => Zone::URBAINE->value,
            'ben_sexe' => Sexe::FEMME->value,
            'ben_type' => 'child',
            'ben_date_naissance' => now()->subYears(10)->format('Y-m-d'),
        ]);
        Beneficiaire::factory()->create([
            'ben_zone' => Zone::RURALE->value,
            'ben_sexe' => Sexe::HOMME->value,
            'ben_type' => 'child',
            'ben_date_naissance' => now()->subYears(10)->format('Y-m-d'),
        ]);

        $response = $this->getJson('/api/beneficiaires?zone=urban&sexe=female');

        $response->assertStatus(200)
                 ->assertJsonCount(1);
    }

    /** @test */
    public function it_shows_a_beneficiaire()
    {
        // Test showing a single beneficiary
        $b = Beneficiaire::factory()->create([
            'ben_type' => 'child',
            'ben_date_naissance' => now()->subYears(10)->format('Y-m-d'),
        ]);

        $response = $this->getJson("/api/beneficiaires/{$b->getKey()}");

        $response->assertStatus(200)
                 ->assertJsonFragment(['ben_nom' => $b->ben_nom]);
    }

    /** @test */
    public function it_returns_404_when_beneficiaire_not_found()
    {
        // Test 404 response when beneficiary is not found
        $response = $this->getJson('/api/beneficiaires/999');

        $response->assertStatus(404);
    }

    /** @test */
    public function it_updates_a_beneficiaire()
    {
        // Test updating a beneficiary
        $b = Beneficiaire::factory()->create([
            'ben_type' => 'child',
            'ben_date_naissance' => now()->subYears(10)->format('Y-m-d'),
        ]);
        $data = $b->toArray();
        $data['ben_nom'] = 'Modifié';

        $response = $this->putJson("/api/beneficiaires/{$b->getKey()}", $data);

        $response->assertStatus(200)
                 ->assertJsonFragment(['ben_nom' => 'Modifié']);

        $this->assertDatabaseHas('beneficiaires', [
            'ben_nom' => 'Modifié',
        ]);
    }

    /** @test */
    public function it_rejects_update_if_type_autre_missing_detail()
    {
        // Test update validation: type "other" requires ben_type_autre
        $b = Beneficiaire::factory()->create([
            'ben_type' => 'child',
            'ben_date_naissance' => now()->subYears(10)->format('Y-m-d'),
        ]);
        $data = $b->toArray();
        $data['ben_type'] = 'other';
        $data['ben_type_autre'] = null;

        $response = $this->putJson("/api/beneficiaires/{$b->getKey()}", $data);

        $response->assertStatus(422)
                 ->assertJsonFragment(['ben_type_autre' => 'Champ requis si type est "Autre"']);
    }

    /** @test */
    public function it_returns_200_on_update_with_no_changes()
    {
        // Test update endpoint with no changes
        $b = Beneficiaire::factory()->create([
            'ben_type' => 'child',
            'ben_date_naissance' => now()->subYears(10)->format('Y-m-d'),
        ]);
        $data = $b->toArray();

        $response = $this->putJson("/api/beneficiaires/{$b->getKey()}", $data);

        $response->assertStatus(200);
    }

    /** @test */
    public function it_updates_only_one_field()
    {
        // Test updating only one field of a beneficiary
        $b = Beneficiaire::factory()->create([
            'ben_type' => 'child',
            'ben_date_naissance' => now()->subYears(10)->format('Y-m-d'),
        ]);
        $data = $b->toArray();
        $data['ben_ethnicite'] = 'NouvelleEthnie';

        $response = $this->putJson("/api/beneficiaires/{$b->getKey()}", $data);

        $response->assertStatus(200)
                 ->assertJsonFragment(['ben_ethnicite' => 'NouvelleEthnie']);
    }

    /** @test */
    public function it_deletes_a_beneficiaire()
    {
        // Test deleting a beneficiary
        $b = Beneficiaire::factory()->create([
            'ben_type' => 'child',
            'ben_date_naissance' => now()->subYears(10)->format('Y-m-d'),
        ]);

        $response = $this->deleteJson("/api/beneficiaires/{$b->getKey()}");

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Bénéficiaire supprimé avec succès']);

        $this->assertDatabaseMissing('beneficiaires', [
        'ben_id' => $b->getKey(),
        ]);
    }

    /** @test */
    public function it_returns_404_on_second_delete()
    {
        // Test deleting a beneficiary twice returns 404 on second attempt
        $b = Beneficiaire::factory()->create([
            'ben_type' => 'child',
            'ben_date_naissance' => now()->subYears(10)->format('Y-m-d'),
        ]);

        $this->deleteJson("/api/beneficiaires/{$b->getKey()}");
        $response = $this->deleteJson("/api/beneficiaires/{$b->getKey()}");

        $response->assertStatus(404);
    }
}
