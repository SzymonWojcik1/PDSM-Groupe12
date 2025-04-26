<?php

namespace Tests\Feature;

use App\Models\Activites;
use App\Models\Partenaire;
use App\Models\Projet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

class ActivitesControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function can_list_activities()
    {
        Activites::factory()->count(3)->create();

        $response = $this->getJson('/api/activites');

        $response->assertOk()
            ->assertJsonCount(3);
    }

    /** @test */
    public function can_create_activity()
    {
        $partenaire = Partenaire::factory()->create();
        $projet = Projet::factory()->create();
        $now = Carbon::now()->addDays(5);

        $payload = [
            'act_nom' => 'Nouvelle activité',
            'act_dateDebut' => $now->format('Y-m-d'),
            'act_dateFin' => $now->addDays(2)->format('Y-m-d'),
            'act_part_id' => $partenaire->part_id,
            'act_pro_id' => $projet->pro_id,
        ];

        $response = $this->postJson('/api/activites', $payload);

        $response->assertCreated()
            ->assertJsonFragment(['act_nom' => 'Nouvelle activité']);
    }

    /** @test */
    public function cannot_create_activity_with_missing_fields()
    {
        $response = $this->postJson('/api/activites', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['act_nom', 'act_dateDebut', 'act_dateFin', 'act_part_id', 'act_pro_id']);
    }

    /** @test */
    public function cannot_create_activity_with_past_dates()
    {
        $partenaire = Partenaire::factory()->create();
        $projet = Projet::factory()->create();
        $yesterday = Carbon::yesterday();

        $payload = [
            'act_nom' => 'Activité passée',
            'act_dateDebut' => $yesterday->format('Y-m-d'),
            'act_dateFin' => $yesterday->addDays(1)->format('Y-m-d'),
            'act_part_id' => $partenaire->part_id,
            'act_pro_id' => $projet->pro_id,
        ];

        $response = $this->postJson('/api/activites', $payload);

        $response->assertStatus(400)
            ->assertJsonFragment(['message' => 'Les dates ne peuvent pas être dans le passé.']);
    }

    /** @test */
    public function cannot_create_activity_with_end_date_before_start_date()
    {
        $partenaire = Partenaire::factory()->create();
        $projet = Projet::factory()->create();
        $now = Carbon::now()->addDays(5);

        $payload = [
            'act_nom' => 'Mauvaise date',
            'act_dateDebut' => $now->format('Y-m-d'),       // ex: 2025-05-01
            'act_dateFin' => $now->subDays(2)->format('Y-m-d'), // ex: 2025-04-29
            'act_part_id' => $partenaire->part_id,
            'act_pro_id' => $projet->pro_id,
        ];

        $response = $this->postJson('/api/activites', $payload);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['act_dateFin']);
    }

    /** @test */
    public function cannot_create_duplicate_activity()
    {
        $activite = Activites::factory()->create();

        $payload = [
            'act_nom' => $activite->act_nom,
            'act_dateDebut' => $activite->act_dateDebut,
            'act_dateFin' => $activite->act_dateFin,
            'act_part_id' => $activite->act_part_id,
            'act_pro_id' => $activite->act_pro_id,
        ];

        $response = $this->postJson('/api/activites', $payload);

        $response->assertStatus(409);
    }

    /** @test */
    public function can_show_activity()
    {
        $activite = Activites::factory()->create();

        $response = $this->getJson("/api/activites/{$activite->act_id}");

        $response->assertOk()
            ->assertJsonFragment(['act_nom' => $activite->act_nom]);
    }

    /** @test */
    public function cannot_show_non_existing_activity()
    {
        $response = $this->getJson('/api/activites/999');

        $response->assertStatus(404)
            ->assertJsonFragment(['message' => 'Activité non trouvée']);
    }

    /** @test */
    public function can_update_activity()
    {
        $activite = Activites::factory()->create();
        $now = Carbon::now()->addDays(10);

        $payload = [
            'act_nom' => 'Activité mise à jour',
            'act_dateDebut' => $now->format('Y-m-d'),
            'act_dateFin' => $now->addDays(3)->format('Y-m-d'),
            'act_part_id' => $activite->act_part_id,
            'act_pro_id' => $activite->act_pro_id,
        ];

        $response = $this->putJson("/api/activites/{$activite->act_id}", $payload);

        $response->assertOk()
            ->assertJsonFragment(['act_nom' => 'Activité mise à jour']);
    }

    /** @test */
    public function cannot_update_started_activity()
    {
        $activite = Activites::factory()->create([
            'act_dateDebut' => Carbon::now()->subDays(2)->format('Y-m-d'),
            'act_dateFin' => Carbon::now()->addDays(2)->format('Y-m-d'),
        ]);

        $payload = [
            'act_nom' => 'Essai modification',
            'act_dateDebut' => Carbon::now()->addDays(10)->format('Y-m-d'),
            'act_dateFin' => Carbon::now()->addDays(12)->format('Y-m-d'),
            'act_part_id' => $activite->act_part_id,
            'act_pro_id' => $activite->act_pro_id,
        ];

        $response = $this->putJson("/api/activites/{$activite->act_id}", $payload);

        $response->assertStatus(403);
    }

    /** @test */
    public function cannot_update_non_existing_activity()
    {
        $partenaire = Partenaire::factory()->create();
        $projet = Projet::factory()->create();
        $now = Carbon::now()->addDays(10);

        $payload = [
            'act_nom' => 'Tentative update',
            'act_dateDebut' => $now->format('Y-m-d'),
            'act_dateFin' => $now->addDays(5)->format('Y-m-d'),
            'act_part_id' => $partenaire->part_id,
            'act_pro_id' => $projet->pro_id,
        ];

        $response = $this->putJson('/api/activites/999', $payload);

        $response->assertStatus(404)
            ->assertJsonFragment(['message' => 'Activité non trouvée']);
    }

    /** @test */
    public function can_delete_activity()
    {
        $activite = Activites::factory()->create();

        $response = $this->deleteJson("/api/activites/{$activite->act_id}");

        $response->assertOk()
            ->assertJson(['message' => 'Activité supprimée']);

        $this->assertDatabaseMissing('activites', [
            'act_id' => $activite->act_id,
        ]);
    }

    /** @test */
    public function cannot_delete_non_existing_activity()
    {
        $response = $this->deleteJson('/api/activites/999');

        $response->assertStatus(404)
            ->assertJsonFragment(['message' => 'Activité non trouvée']);
    }

    /** @test */
    public function cannot_create_activity_with_non_existing_partenaire_or_projet()
    {
        $now = Carbon::now()->addDays(5);

        $payload = [
            'act_nom' => 'Activité test',
            'act_dateDebut' => $now->format('Y-m-d'),
            'act_dateFin' => $now->addDays(2)->format('Y-m-d'),
            'act_part_id' => 9999, // ID inexistant
            'act_pro_id' => 9999,  // ID inexistant
        ];

        $response = $this->postJson('/api/activites', $payload);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['act_part_id', 'act_pro_id']);
    }

    /** @test */
    public function cannot_update_activity_with_invalid_data()
    {
        $activite = Activites::factory()->create();
        $now = Carbon::now()->addDays(10);

        $payload = [
            'act_nom' => '', // Nom vide => invalide
            'act_dateDebut' => $now->format('Y-m-d'),
            'act_dateFin' => $now->addDays(3)->format('Y-m-d'),
            'act_part_id' => $activite->act_part_id,
            'act_pro_id' => $activite->act_pro_id,
        ];

        $response = $this->putJson("/api/activites/{$activite->act_id}", $payload);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['act_nom']);
    }


}
