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
        $data = Beneficiaire::factory()->make()->toArray();

        $response = $this->postJson('/api/beneficiaires', $data);

        $response->assertStatus(201)
                 ->assertJsonFragment(['ben_nom' => $data['ben_nom']]);
    }

    /** @test */
    public function it_rejects_missing_required_fields()
    {
        $data = Beneficiaire::factory()->make(['ben_nom' => null])->toArray();

        $response = $this->postJson('/api/beneficiaires', $data);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['ben_nom']);
    }

    /** @test */
    public function it_rejects_type_autre_without_type_autre()
    {
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
        Beneficiaire::factory()->count(3)->create();

        $response = $this->getJson('/api/beneficiaires');

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    /** @test */
    public function it_filters_beneficiaires_by_fields()
    {
        Beneficiaire::factory()->create(['ben_zone' => Zone::URBAINE->value, 'ben_sexe' => Sexe::FEMME->value]);
        Beneficiaire::factory()->create(['ben_zone' => Zone::RURALE->value, 'ben_sexe' => Sexe::HOMME->value]);

        $response = $this->getJson('/api/beneficiaires?zone=urban&sexe=female');

        $response->assertStatus(200)
                 ->assertJsonCount(1);
    }

    /** @test */
    public function it_filters_beneficiaires_by_search_term()
    {
        Beneficiaire::factory()->create(['ben_prenom' => 'Jean', 'ben_nom' => 'Dupont']);
        Beneficiaire::factory()->create(['ben_prenom' => 'Alice', 'ben_nom' => 'Martin']);

        $response = $this->getJson('/api/beneficiaires?search=Jean');

        $response->assertStatus(200)
                 ->assertJsonCount(1)
                 ->assertJsonFragment(['ben_prenom' => 'Jean']);
    }

    /** @test */
    public function it_shows_a_beneficiaire()
    {
        $b = Beneficiaire::factory()->create();

        $response = $this->getJson("/api/beneficiaires/{$b->getKey()}");

        $response->assertStatus(200)
                 ->assertJsonFragment(['ben_nom' => $b->ben_nom]);
    }

    /** @test */
    public function it_returns_404_when_beneficiaire_not_found()
    {
        $response = $this->getJson('/api/beneficiaires/999');

        $response->assertStatus(404);
    }

    /** @test */
    public function it_updates_a_beneficiaire()
    {
        $b = Beneficiaire::factory()->create();
        $data = $b->toArray();
        $data['ben_nom'] = 'Modifié';

        $response = $this->putJson("/api/beneficiaires/{$b->getKey()}", $data);

        $response->assertStatus(200)
                 ->assertJsonFragment(['ben_nom' => 'Modifié']);
    }

    /** @test */
    public function it_rejects_update_if_type_autre_missing_detail()
    {
        $b = Beneficiaire::factory()->create();
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
        $b = Beneficiaire::factory()->create();
        $data = $b->toArray();

        $response = $this->putJson("/api/beneficiaires/{$b->getKey()}", $data);

        $response->assertStatus(200);
    }

    /** @test */
    public function it_updates_only_one_field()
    {
        $b = Beneficiaire::factory()->create();
        $data = $b->toArray();
        $data['ben_ethnicite'] = 'NouvelleEthnie';

        $response = $this->putJson("/api/beneficiaires/{$b->getKey()}", $data);

        $response->assertStatus(200)
                 ->assertJsonFragment(['ben_ethnicite' => 'NouvelleEthnie']);
    }

    /** @test */
    public function it_deletes_a_beneficiaire()
    {
        $b = Beneficiaire::factory()->create();

        $response = $this->deleteJson("/api/beneficiaires/{$b->getKey()}");

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Bénéficiaire supprimé avec succès']);
    }

    /** @test */
    public function it_returns_404_on_second_delete()
    {
        $b = Beneficiaire::factory()->create();
        $this->deleteJson("/api/beneficiaires/{$b->getKey()}");

        $response = $this->deleteJson("/api/beneficiaires/{$b->getKey()}");

        $response->assertStatus(404);
    }

    /** @test */
    public function it_rejects_invalid_enum_values()
    {
        $response = $this->postJson('/api/beneficiaires', [
            'ben_prenom' => 'Ali',
            'ben_nom' => 'Testeur',
            'ben_date_naissance' => '1990-01-01',
            'ben_region' => 'R1',
            'ben_pays' => 'P1',
            'ben_type' => 'invalid_type',
            'ben_type_autre' => null,
            'ben_zone' => 'invalid_zone',
            'ben_sexe' => 'invalid_sexe',
            'ben_sexe_autre' => null,
            'ben_genre' => 'invalid_genre',
            'ben_genre_autre' => null,
            'ben_ethnicite' => 'ethnie',
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors([
                    'ben_type', 'ben_zone', 'ben_sexe', 'ben_genre'
                ]);
    }


    /** @test */
    public function it_rejects_exceeding_max_length_fields()
    {
        $data = Beneficiaire::factory()->make([
            'ben_nom' => str_repeat('a', 51),      // max 50
            'ben_prenom' => str_repeat('b', 51),   // max 50
        ])->toArray();

        $response = $this->postJson('/api/beneficiaires', $data);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['ben_nom', 'ben_prenom']);
    }
}