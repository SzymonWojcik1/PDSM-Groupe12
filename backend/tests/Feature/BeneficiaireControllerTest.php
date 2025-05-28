<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Beneficiaire;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Enums\Type;
use App\Enums\Zone;
use App\Enums\Sexe;
use App\Enums\Genre;
use Carbon\Carbon;

class BeneficiaireControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function authenticate(): User
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        return $user;
    }

    /** @test */
    public function it_lists_all_beneficiaires()
    {
        $this->authenticate();

        Beneficiaire::factory()->count(5)->create();

        $response = $this->getJson('/api/beneficiaires');

        $response->assertStatus(200)
                 ->assertJsonCount(5);
    }

    /** @test */
    public function it_filters_beneficiaires_by_region_and_other_params()
    {
        $this->authenticate();

        // Create matching and non-matching records
        Beneficiaire::factory()->create([ 'ben_region' => 'R1', 'ben_pays' => 'P1', 'ben_zone' => Zone::RURALE->value ]);
        Beneficiaire::factory()->create([ 'ben_region' => 'R2', 'ben_pays' => 'P2', 'ben_zone' => Zone::URBAINE->value ]);

        $response = $this->getJson('/api/beneficiaires?region=R1&pays=P1&zone=' . Zone::RURALE->value);

        $response->assertStatus(200)
                 ->assertJsonCount(1);
    }

    /** @test */
    public function it_searches_by_nom_or_prenom()
    {
        $this->authenticate();

        Beneficiaire::factory()->create([ 'ben_prenom' => 'Alice', 'ben_nom' => 'Dupont' ]);
        Beneficiaire::factory()->create([ 'ben_prenom' => 'Bob', 'ben_nom' => 'Martin' ]);

        $response = $this->getJson('/api/beneficiaires?search=Ali');
        $response->assertStatus(200)
                 ->assertJsonCount(1)
                 ->assertJsonFragment(['ben_prenom' => 'Alice']);
    }

    /** @test */
    public function it_stores_a_valid_beneficiaire()
    {
        $this->authenticate();

        $payload = [
            'ben_prenom' => 'Jean',
            'ben_nom' => 'Pierre',
            'ben_date_naissance' => Carbon::now()->subYears(20)->toDateString(),
            'ben_region' => 'RegionX',
            'ben_pays' => 'PaysY',
            'ben_type' => Type::JEUNE->value,
            'ben_type_autre' => null,
            'ben_zone' => Zone::URBAINE->value,
            'ben_sexe' => Sexe::HOMME->value,
            'ben_sexe_autre' => null,
            'ben_genre' => Genre::AUTRE->value,
            'ben_genre_autre' => 'Genre custom',
            'ben_ethnicite' => 'EthnieZ',
        ];

        $response = $this->postJson('/api/beneficiaires', $payload);

        $response->assertStatus(201)
                 ->assertJsonFragment(['ben_prenom' => 'Jean', 'ben_nom' => 'Pierre']);

        $this->assertDatabaseHas('beneficiaires', [
            'ben_prenom' => 'Jean',
            'ben_nom' => 'Pierre',
        ]);
    }

    /** @test */
    public function it_validates_required_fields_on_store()
    {
        $this->authenticate();

        $response = $this->postJson('/api/beneficiaires', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors([
                     'ben_prenom', 'ben_nom', 'ben_date_naissance',
                     'ben_region', 'ben_pays', 'ben_type',
                     'ben_zone', 'ben_sexe', 'ben_ethnicite'
                 ]);
    }

    /** @test */
    public function it_requires_type_autre_when_type_is_autre()
    {
        $this->authenticate();

        $payload = Beneficiaire::factory()->make([
            'ben_type' => Type::AUTRE->value,
            'ben_type_autre' => null
        ])->toArray();
        $payload = array_merge($payload, [
            'ben_zone' => Zone::URBAINE->value,
            'ben_sexe' => Sexe::HOMME->value,
            'ben_ethnicite' => 'E'
        ]);

        $response = $this->postJson('/api/beneficiaires', $payload);
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['ben_type_autre']);
    }

    /** @test */
    public function it_validates_age_for_enfant_type()
    {
        $this->authenticate();

        $date = Carbon::now()->subYears(4)->toDateString();
        $payload = Beneficiaire::factory()->make([
            'ben_date_naissance' => $date,
            'ben_type' => Type::ENFANT->value
        ])->toArray();
        $payload = array_merge($payload, [
            'ben_zone' => Zone::URBAINE->value,
            'ben_sexe' => Sexe::FEMME->value,
            'ben_ethnicite' => 'E'
        ]);

        $response = $this->postJson('/api/beneficiaires', $payload);
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['ben_date_naissance']);
    }

    /** @test */
    public function it_shows_a_single_beneficiaire()
    {
        $this->authenticate();

        $b = Beneficiaire::factory()->create();

        $response = $this->getJson("/api/beneficiaires/{$b->ben_id}");

        $response->assertStatus(200)
                 ->assertJsonFragment(['ben_id' => $b->ben_id]);
    }

    /** @test */
    public function it_returns_404_when_show_nonexistent()
    {
        $this->authenticate();

        $response = $this->getJson('/api/beneficiaires/999');
        $response->assertStatus(404);
    }

    /** @test */
    public function it_updates_a_beneficiaire()
    {
        $this->authenticate();

        $b = Beneficiaire::factory()->create();
        $payload = [
            'ben_prenom' => 'Updated',
            'ben_nom' => 'Name',
            'ben_date_naissance' => Carbon::now()->subYears(25)->toDateString(),
            'ben_region' => 'R',
            'ben_pays' => 'P',
            'ben_type' => Type::JEUNE->value,
            'ben_type_autre' => null,
            'ben_zone' => Zone::URBAINE->value,
            'ben_sexe' => Sexe::HOMME->value,
            'ben_sexe_autre' => null,
            'ben_genre' => null,
            'ben_genre_autre' => null,
            'ben_ethnicite' => 'E'
        ];

        $response = $this->putJson("/api/beneficiaires/{$b->ben_id}", $payload);
        $response->assertStatus(200)
                 ->assertJsonFragment(['ben_prenom' => 'Updated']);

        $this->assertDatabaseHas('beneficiaires', ['ben_prenom' => 'Updated']);
    }

    /** @test */
    public function it_deletes_a_beneficiaire()
    {
        $this->authenticate();

        $b = Beneficiaire::factory()->create();
        $response = $this->deleteJson("/api/beneficiaires/{$b->ben_id}");
        $response->assertStatus(200)
                 ->assertJsonFragment(['message' => 'Bénéficiaire supprimé avec succès']);

        $this->assertDatabaseMissing('beneficiaires', ['ben_id' => $b->ben_id]);
    }

    /** @test */
    public function it_checks_duplicate_and_returns_exists()
    {
        $this->authenticate();

        $b = Beneficiaire::factory()->create();
        $payload = [
            'ben_nom' => $b->ben_nom,
            'ben_prenom' => $b->ben_prenom,
            'ben_date_naissance' => $b->ben_date_naissance,
            'ben_sexe' => $b->ben_sexe->value
        ];

        $response = $this->postJson('/api/beneficiaires/check-duplicate', $payload);
        $response->assertStatus(200)
                 ->assertJsonFragment(['exists' => true]);
    }

    /** @test */
    public function it_checks_duplicate_and_returns_false_when_none()
    {
        $this->authenticate();

        $payload = [
            'ben_nom' => 'X',
            'ben_prenom' => 'Y',
            'ben_date_naissance' => Carbon::now()->subYears(30)->toDateString(),
            'ben_sexe' => Sexe::FEMME->value
        ];

        $response = $this->postJson('/api/beneficiaires/check-duplicate', $payload);
        $response->assertStatus(200)
                 ->assertJsonFragment(['exists' => false]);
    }

    /** @test */
    public function it_validates_fields_on_check_duplicate()
    {
        $this->authenticate();

        $response = $this->postJson('/api/beneficiaires/check-duplicate', []);
        $response->assertStatus(422)
                 ->assertJsonValidationErrors([
                     'ben_nom', 'ben_prenom', 'ben_date_naissance', 'ben_sexe'
                 ]);
    }
}
