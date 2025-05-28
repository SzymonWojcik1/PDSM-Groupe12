<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Activites;
use App\Models\Partenaire;
use App\Models\Projet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

class ActivitesControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function authenticate(): User
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        return $user;
    }

    protected function createDependencies(): array
    {
        return [
            'partenaire' => Partenaire::factory()->create(),
            'projet' => Projet::factory()->create(),
        ];
    }

    /** @test */
    public function it_lists_all_activities()
    {
        $this->authenticate();
        Activites::factory()->count(3)->create();
        $response = $this->getJson('/api/activites');
        $response->assertStatus(200)->assertJsonCount(3);
    }

    /** @test */
    public function it_creates_a_valid_activity()
    {
        $this->authenticate();
        $dep = $this->createDependencies();

        $payload = [
            'act_nom' => 'Formation Laravel',
            'act_dateDebut' => now()->addDays(2)->toDateString(),
            'act_dateFin' => now()->addDays(3)->toDateString(),
            'act_part_id' => $dep['partenaire']->part_id,
            'act_pro_id' => $dep['projet']->pro_id,
        ];

        $response = $this->postJson('/api/activites', $payload);
        $response->assertStatus(201)->assertJsonFragment(['act_nom' => 'Formation Laravel']);
    }

    /** @test */
    public function it_rejects_activity_with_past_dates()
    {
        $this->authenticate();
        $dep = $this->createDependencies();

        $payload = [
            'act_nom' => 'Ancienne activité',
            'act_dateDebut' => now()->subDays(5)->toDateString(),
            'act_dateFin' => now()->subDays(3)->toDateString(),
            'act_part_id' => $dep['partenaire']->part_id,
            'act_pro_id' => $dep['projet']->pro_id,
        ];

        $response = $this->postJson('/api/activites', $payload);
        $response->assertStatus(400);
    }

    /** @test */
    public function it_prevents_duplicate_activity()
    {
        $this->authenticate();
        $dep = $this->createDependencies();

        $payload = [
            'act_nom' => 'Activité unique',
            'act_dateDebut' => now()->addDays(1)->toDateString(),
            'act_dateFin' => now()->addDays(2)->toDateString(),
            'act_part_id' => $dep['partenaire']->part_id,
            'act_pro_id' => $dep['projet']->pro_id,
        ];

        $this->postJson('/api/activites', $payload)->assertStatus(201);
        $this->postJson('/api/activites', $payload)->assertStatus(409);
    }

    /** @test */
    public function it_shows_an_existing_activity()
    {
        $this->authenticate();
        $act = Activites::factory()->create();
        $this->getJson("/api/activites/{$act->act_id}")->assertStatus(200)->assertJsonFragment(['act_id' => $act->act_id]);
    }

    /** @test */
    public function it_returns_404_for_non_existing_activity()
    {
        $this->authenticate();
        $this->getJson('/api/activites/99999')->assertStatus(404);
    }

    /** @test */
    public function it_updates_an_activity_before_start()
    {
        $this->authenticate();
        $dep = $this->createDependencies();

        $act = Activites::factory()->create([
            'act_dateDebut' => now()->addDays(3),
            'act_dateFin' => now()->addDays(4),
        ]);

        $payload = [
            'act_nom' => 'Activité modifiée',
            'act_dateDebut' => now()->addDays(5)->toDateString(),
            'act_dateFin' => now()->addDays(6)->toDateString(),
            'act_part_id' => $dep['partenaire']->part_id,
            'act_pro_id' => $dep['projet']->pro_id,
        ];

        $this->putJson("/api/activites/{$act->act_id}", $payload)->assertStatus(200)->assertJsonFragment(['act_nom' => 'Activité modifiée']);
    }

    /** @test */
    public function it_rejects_update_if_activity_started()
    {
        $this->authenticate();
        $act = Activites::factory()->create([
            'act_dateDebut' => now()->subDays(1),
            'act_dateFin' => now()->addDays(1),
        ]);

        $this->putJson("/api/activites/{$act->act_id}", [
            'act_nom' => 'Test',
            'act_dateDebut' => now()->addDays(1)->toDateString(),
            'act_dateFin' => now()->addDays(2)->toDateString(),
            'act_part_id' => $act->act_part_id,
            'act_pro_id' => $act->act_pro_id,
        ])->assertStatus(403);
    }

    /** @test */
    public function it_deletes_an_activity()
    {
        $this->authenticate();
        $act = Activites::factory()->create();
        $this->deleteJson("/api/activites/{$act->act_id}")->assertStatus(200)->assertJsonFragment(['message' => 'Activité supprimée']);
        $this->assertDatabaseMissing('activites', ['act_id' => $act->act_id]);
    }

    /** @test */
    public function it_returns_404_when_deleting_non_existing_activity()
    {
        $this->authenticate();
        $this->deleteJson("/api/activites/99999")->assertStatus(404);
    }

    /** @test */
    public function it_validates_required_fields_on_creation()
    {
        $this->authenticate();

        $response = $this->postJson('/api/activites', []); // vide

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['act_nom', 'act_dateDebut', 'act_dateFin', 'act_part_id', 'act_pro_id']);
    }

    /** @test */
    public function it_validates_required_fields_on_update()
    {
        $this->authenticate();
        $act = Activites::factory()->create([
            'act_dateDebut' => now()->addDays(2),
            'act_dateFin' => now()->addDays(3),
        ]);

        $response = $this->putJson("/api/activites/{$act->act_id}", []); // vide

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['act_nom', 'act_dateDebut', 'act_dateFin', 'act_part_id', 'act_pro_id']);
    }

    /** @test */
    public function it_rejects_creation_if_start_date_is_after_end_date()
    {
        $this->authenticate();
        $dep = $this->createDependencies();

        $response = $this->postJson('/api/activites', [
            'act_nom' => 'Date inversée',
            'act_dateDebut' => now()->addDays(5)->toDateString(),
            'act_dateFin' => now()->addDays(2)->toDateString(),
            'act_part_id' => $dep['partenaire']->part_id,
            'act_pro_id' => $dep['projet']->pro_id,
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['act_dateFin']);
    }


    /** @test */
    public function it_rejects_update_if_start_date_is_after_end_date()
    {
        $this->authenticate();
        $dep = $this->createDependencies();

        $act = Activites::factory()->create([
            'act_dateDebut' => now()->addDays(3),
            'act_dateFin' => now()->addDays(4),
            'act_part_id' => $dep['partenaire']->part_id,
            'act_pro_id' => $dep['projet']->pro_id,
        ]);

        $response = $this->putJson("/api/activites/{$act->act_id}", [
            'act_nom' => 'Update inversé',
            'act_dateDebut' => now()->addDays(5)->toDateString(),
            'act_dateFin' => now()->addDays(2)->toDateString(), // Fin < Début
            'act_part_id' => $dep['partenaire']->part_id,
            'act_pro_id' => $dep['projet']->pro_id,
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['act_dateFin']);
    }

    /** @test */
    public function it_rejects_creation_with_invalid_foreign_keys()
    {
        $this->authenticate();

        $response = $this->postJson('/api/activites', [
            'act_nom' => 'FK test',
            'act_dateDebut' => now()->addDays(2)->toDateString(),
            'act_dateFin' => now()->addDays(3)->toDateString(),
            'act_part_id' => 99999,
            'act_pro_id' => 99999,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['act_part_id', 'act_pro_id']);
    }
}
