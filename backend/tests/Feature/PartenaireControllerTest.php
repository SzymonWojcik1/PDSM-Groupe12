<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Partenaire;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PartenaireControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function authenticate(): User
    {
        $user = User::factory()->create(['role' => 'siege']);
        $this->actingAs($user);
        return $user;
    }

    /** @test */
    public function it_lists_all_partenaires()
    {
        $this->authenticate();
        Partenaire::factory()->count(3)->create();

        $response = $this->getJson('/api/partenaires');

        $response->assertStatus(200)
                 ->assertJsonCount(4); // 3 created + 1 default partenaire
    }

    /** @test */
    public function it_creates_a_valid_partenaire()
    {
        $this->authenticate();
        $payload = [
            'part_nom' => 'Partenaire Test',
            'part_pays' => 'France',
            'part_region' => 'Île-de-France',
        ];

        $response = $this->postJson('/api/partenaires', $payload);

        $response->assertStatus(201)
                 ->assertJsonFragment(['part_nom' => 'Partenaire Test']);
    }

    /** @test */
    public function it_rejects_creation_with_missing_fields()
    {
        $this->authenticate();
        $response = $this->postJson('/api/partenaires', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['part_nom', 'part_pays', 'part_region']);
    }

    /** @test */
    public function it_rejects_duplicate_partenaire_on_creation()
    {
        $this->authenticate();

        Partenaire::factory()->create([
            'part_nom' => 'Duplicate',
            'part_pays' => 'France',
        ]);

        $payload = [
            'part_nom' => 'Duplicate',
            'part_pays' => 'France',
            'part_region' => 'Île-de-France',
        ];

        $response = $this->postJson('/api/partenaires', $payload);

        $response->assertStatus(409)
                 ->assertJsonFragment(['message' => 'Un partenaire avec ce nom et ce pays existe déjà.']);
    }

    /** @test */
    public function it_shows_a_partenaire()
    {
        $this->authenticate();
        $partenaire = Partenaire::factory()->create();

        $response = $this->getJson("/api/partenaires/{$partenaire->part_id}");

        $response->assertStatus(200)
                 ->assertJsonFragment(['part_nom' => $partenaire->part_nom]);
    }

    /** @test */
    public function it_returns_404_for_non_existing_partenaire()
    {
        $this->authenticate();
        $response = $this->getJson('/api/partenaires/999');

        $response->assertStatus(404)
                 ->assertJsonFragment(['message' => 'Partenaire non trouvé']);
    }

    /** @test */
    public function it_updates_a_valid_partenaire()
    {
        $this->authenticate();
        $partenaire = Partenaire::factory()->create();

        $payload = [
            'part_nom' => 'Updated Name',
            'part_pays' => 'Suisse',
            'part_region' => 'Genève',
        ];

        $response = $this->putJson("/api/partenaires/{$partenaire->part_id}", $payload);

        $response->assertStatus(200)
                 ->assertJsonFragment(['part_nom' => 'Updated Name']);
    }

    /** @test */
    public function it_rejects_duplicate_partenaire_on_update()
    {
        $this->authenticate();

        Partenaire::factory()->create([
            'part_nom' => 'Exist',
            'part_pays' => 'Suisse',
        ]);

        $partenaire = Partenaire::factory()->create();

        $payload = [
            'part_nom' => 'Exist',
            'part_pays' => 'Suisse',
            'part_region' => 'Vaud',
        ];

        $response = $this->putJson("/api/partenaires/{$partenaire->part_id}", $payload);

        $response->assertStatus(409)
                 ->assertJsonFragment(['message' => 'Un partenaire avec ce nom et ce pays existe déjà.']);
    }

    /** @test */
    public function it_returns_404_when_updating_non_existing_partenaire()
    {
        $this->authenticate();

        $payload = [
            'part_nom' => 'Inexistant',
            'part_pays' => 'Suisse',
            'part_region' => 'Genève',
        ];

        $response = $this->putJson('/api/partenaires/999', $payload);

        $response->assertStatus(404)
                 ->assertJsonFragment(['message' => 'Partenaire non trouvé']);
    }

    /** @test */
    public function it_deletes_a_partenaire()
    {
        $this->authenticate();
        $partenaire = Partenaire::factory()->create();

        $response = $this->deleteJson("/api/partenaires/{$partenaire->part_id}");

        $response->assertStatus(200)
                 ->assertJsonFragment(['message' => 'Partenaire supprimé']);
    }

    /** @test */
    public function it_returns_404_when_deleting_non_existing_partenaire()
    {
        $this->authenticate();

        $response = $this->deleteJson('/api/partenaires/999');

        $response->assertStatus(404)
                 ->assertJsonFragment(['message' => 'Partenaire non trouvé']);
    }

    /** @test */
    public function it_lists_users_of_a_partenaire()
    {
        $this->authenticate();

        $partenaire = Partenaire::factory()->create();

        User::factory()->create([
            'partenaire_id' => $partenaire->part_id,
        ]);

        $response = $this->getJson("/api/partenaires/{$partenaire->part_id}/users");

        $response->assertStatus(200)
                 ->assertJsonFragment(['partenaire' => $partenaire->part_nom]);
    }

    /** @test */
    public function it_returns_404_when_listing_users_of_non_existing_partenaire()
    {
        $this->authenticate();

        $response = $this->getJson('/api/partenaires/999/users');

        $response->assertStatus(404)
                 ->assertJsonFragment(['message' => 'Partenaire non trouvé']);
    }
}
