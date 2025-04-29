<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Projet;
use App\Models\Partenaire;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

class ProjetControllerTest extends TestCase
{
    use RefreshDatabase;

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_lists_all_projects()
    {
        Projet::factory()->count(3)->create();

        $response = $this->getJson('/api/projets');

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_creates_a_valid_project()
    {
        $partenaire = Partenaire::factory()->create();
        $debut = Carbon::now()->addDays(5)->format('Y-m-d');
        $fin = Carbon::now()->addDays(10)->format('Y-m-d');

        $payload = [
            'pro_nom' => 'Nouveau Projet',
            'pro_dateDebut' => $debut,
            'pro_dateFin' => $fin,
            'pro_part_id' => $partenaire->part_id,
        ];

        $response = $this->postJson('/api/projets', $payload);

        $response->assertStatus(201)
                 ->assertJsonFragment(['pro_nom' => 'Nouveau Projet']);

        $this->assertDatabaseHas('projet', [
            'pro_nom' => 'Nouveau Projet',
            'pro_part_id' => $partenaire->part_id,
        ]);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_rejects_project_creation_with_missing_fields()
    {
        $response = $this->postJson('/api/projets', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['pro_nom', 'pro_dateDebut', 'pro_dateFin', 'pro_part_id']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_rejects_project_creation_with_past_dates()
    {
        $partenaire = Partenaire::factory()->create();
        $debut = Carbon::yesterday()->format('Y-m-d');
        $fin = Carbon::now()->format('Y-m-d');

        $payload = [
            'pro_nom' => 'Projet Passé',
            'pro_dateDebut' => $debut,
            'pro_dateFin' => $fin,
            'pro_part_id' => $partenaire->part_id,
        ];

        $response = $this->postJson('/api/projets', $payload);

        $response->assertStatus(400)
                 ->assertJsonFragment(['message' => 'Les dates ne peuvent pas être dans le passé.']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_rejects_project_creation_with_start_after_end()
    {
        $partenaire = Partenaire::factory()->create();
        $debut = Carbon::now()->addDays(10)->format('Y-m-d');
        $fin = Carbon::now()->addDays(5)->format('Y-m-d');

        $payload = [
            'pro_nom' => 'Projet inversé',
            'pro_dateDebut' => $debut,
            'pro_dateFin' => $fin,
            'pro_part_id' => $partenaire->part_id,
        ];

        $response = $this->postJson('/api/projets', $payload);

        $response->assertStatus(400)
                 ->assertJsonFragment(['message' => 'La date de début ne peut pas être après la date de fin.']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_rejects_duplicate_project_creation()
    {
        $partenaire = Partenaire::factory()->create();
        $debut = Carbon::now()->addDays(5)->format('Y-m-d');
        $fin = Carbon::now()->addDays(10)->format('Y-m-d');

        Projet::factory()->create([
            'pro_nom' => 'Projet Identique',
            'pro_dateDebut' => $debut,
            'pro_dateFin' => $fin,
            'pro_part_id' => $partenaire->part_id,
        ]);

        $payload = [
            'pro_nom' => 'Projet Identique',
            'pro_dateDebut' => $debut,
            'pro_dateFin' => $fin,
            'pro_part_id' => $partenaire->part_id,
        ];

        $response = $this->postJson('/api/projets', $payload);

        $response->assertStatus(409)
                 ->assertJsonFragment(['message' => 'Un projet identique existe déjà pour ce partenaire à ces dates.']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_shows_a_project()
    {
        $projet = Projet::factory()->create();

        $response = $this->getJson("/api/projets/{$projet->pro_id}");

        $response->assertStatus(200)
                 ->assertJsonFragment(['pro_nom' => $projet->pro_nom]);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_returns_404_for_non_existing_project()
    {
        $response = $this->getJson('/api/projets/999');

        $response->assertStatus(404)
                 ->assertJsonFragment(['message' => 'Projet non trouvé']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_updates_a_valid_project()
    {
        $projet = Projet::factory()->create();
        $debut = Carbon::now()->addDays(10)->format('Y-m-d');
        $fin = Carbon::now()->addDays(15)->format('Y-m-d');

        $payload = [
            'pro_nom' => 'Projet Mis à Jour',
            'pro_dateDebut' => $debut,
            'pro_dateFin' => $fin,
            'pro_part_id' => $projet->pro_part_id,
        ];

        $response = $this->putJson("/api/projets/{$projet->pro_id}", $payload);

        $response->assertStatus(200)
                 ->assertJsonFragment(['pro_nom' => 'Projet Mis à Jour']);

        $this->assertDatabaseHas('projet', [
            'pro_id' => $projet->pro_id,
            'pro_nom' => 'Projet Mis à Jour',
        ]);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_rejects_update_of_started_project()
    {
        $projet = Projet::factory()->create([
            'pro_dateDebut' => Carbon::now()->subDays(1)->format('Y-m-d'),
            'pro_dateFin' => Carbon::now()->addDays(5)->format('Y-m-d'),
        ]);

        $payload = [
            'pro_nom' => 'Update Impossible',
            'pro_dateDebut' => Carbon::now()->addDays(10)->format('Y-m-d'),
            'pro_dateFin' => Carbon::now()->addDays(15)->format('Y-m-d'),
            'pro_part_id' => $projet->pro_part_id,
        ];

        $response = $this->putJson("/api/projets/{$projet->pro_id}", $payload);

        $response->assertStatus(403)
                 ->assertJsonFragment(['message' => 'Impossible de modifier un projet en cours ou terminé.']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_rejects_update_with_invalid_dates()
    {
        $projet = Projet::factory()->create();
        $debut = Carbon::now()->addDays(15)->format('Y-m-d');
        $fin = Carbon::now()->addDays(10)->format('Y-m-d');

        $payload = [
            'pro_nom' => 'Invalid Dates Update',
            'pro_dateDebut' => $debut,
            'pro_dateFin' => $fin,
            'pro_part_id' => $projet->pro_part_id,
        ];

        $response = $this->putJson("/api/projets/{$projet->pro_id}", $payload);

        $response->assertStatus(400)
                 ->assertJsonFragment(['message' => 'La date de début ne peut pas être après la date de fin.']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_rejects_update_with_duplicate_project()
    {
        $partenaire = Partenaire::factory()->create();
        $debut = Carbon::now()->addDays(5)->format('Y-m-d');
        $fin = Carbon::now()->addDays(10)->format('Y-m-d');

        Projet::factory()->create([
            'pro_nom' => 'Projet Existant',
            'pro_dateDebut' => $debut,
            'pro_dateFin' => $fin,
            'pro_part_id' => $partenaire->part_id,
        ]);

        $projetToUpdate = Projet::factory()->create();

        $payload = [
            'pro_nom' => 'Projet Existant',
            'pro_dateDebut' => $debut,
            'pro_dateFin' => $fin,
            'pro_part_id' => $partenaire->part_id,
        ];

        $response = $this->putJson("/api/projets/{$projetToUpdate->pro_id}", $payload);

        $response->assertStatus(409)
                 ->assertJsonFragment(['message' => 'Un projet identique existe déjà pour ce partenaire à ces dates.']);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_deletes_a_project()
    {
        $projet = Projet::factory()->create();

        $response = $this->deleteJson("/api/projets/{$projet->pro_id}");

        $response->assertStatus(200)
                 ->assertJsonFragment(['message' => 'Projet supprimé']);

        $this->assertDatabaseMissing('projet', [
            'pro_id' => $projet->pro_id,
        ]);
    }

    #[\PHPUnit\Framework\Attributes\Test]
    public function it_returns_404_when_deleting_non_existing_project()
    {
        $response = $this->deleteJson('/api/projets/999');

        $response->assertStatus(404)
                 ->assertJsonFragment(['message' => 'Projet non trouvé']);
    }
}
