<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Evaluation;
use Illuminate\Foundation\Testing\RefreshDatabase;

class EvaluationControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function authenticate(): User
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        return $user;
    }

    /** @test */
    public function it_creates_evaluations_for_users_of_a_partner()
    {
        $this->authenticate();

        $partnerId = 1;
        $users = User::factory()->count(3)->create(['partenaire_id' => $partnerId]);

        $payload = [
            'part_id' => $partnerId,
            'criteres' => [
                ['label' => 'Critère 1', 'reussi' => false],
                ['label' => 'Critère 2', 'reussi' => true],
            ]
        ];

        $response = $this->postJson('/api/evaluations', $payload);

        $response->assertStatus(201)
                 ->assertJsonFragment(['message' => '4 évaluation(s) créée(s)']); // 2 users + 1 for the partner + 1 for the admin

        $this->assertDatabaseCount('evaluations', 4);
    }

    /** @test */
    public function it_returns_all_evaluations()
    {
        $this->authenticate();

        Evaluation::factory()->count(2)->create();

        $response = $this->getJson('/api/evaluations');

        $response->assertStatus(200)
                 ->assertJsonCount(2);
    }

    /** @test */
    public function it_shows_an_evaluation()
    {
        $this->authenticate();

        $evaluation = Evaluation::factory()->create();

        $response = $this->getJson("/api/evaluations/{$evaluation->eva_id}");

        $response->assertStatus(200)
                 ->assertJsonFragment(['eva_id' => $evaluation->eva_id]);
    }

    /** @test */
    public function it_updates_criteres_and_marks_as_submitted()
    {
        $this->authenticate();

        $evaluation = Evaluation::factory()->create([
            'criteres' => [
                ['label' => 'Critère A', 'reussi' => false],
                ['label' => 'Critère B', 'reussi' => false],
            ],
            'eva_statut' => 'en_attente',
        ]);

        $payload = [
            'reponses' => ['reussi', 'reussi']
        ];

        $response = $this->putJson("/api/evaluations/{$evaluation->eva_id}", $payload);

        $response->assertStatus(200)
                 ->assertJsonFragment(['message' => 'Évaluation mise à jour']);

        $this->assertDatabaseHas('evaluations', [
            'eva_id' => $evaluation->eva_id,
            'eva_statut' => 'soumis',
        ]);
    }

    /** @test */
    public function it_changes_statut_of_an_evaluation()
    {
        $this->authenticate();

        $evaluation = Evaluation::factory()->create(['eva_statut' => 'en_attente']);

        $response = $this->patchJson("/api/evaluations/{$evaluation->eva_id}/soumettre", [
            'eva_statut' => 'valide'
        ]);

        $response->assertStatus(200)
                 ->assertJsonFragment(['eva_statut' => 'valide']);
    }

    /** @test */
    public function it_returns_pending_evaluations_for_a_user()
    {
        $user = $this->authenticate();

        Evaluation::factory()->create([
            'eva_use_id' => $user->id,
            'eva_statut' => 'en_attente'
        ]);

        Evaluation::factory()->create([
            'eva_use_id' => $user->id,
            'eva_statut' => 'valide'
        ]);

        $response = $this->getJson("/api/mes-evaluations?user_id={$user->id}");

        $response->assertStatus(200)
                 ->assertJsonCount(1);
    }

    /** @test */
    public function it_counts_pending_evaluations_for_a_user()
    {
        $user = $this->authenticate();

        Evaluation::factory()->count(2)->create([
            'eva_use_id' => $user->id,
            'eva_statut' => 'en_attente'
        ]);

        Evaluation::factory()->create([
            'eva_use_id' => $user->id,
            'eva_statut' => 'valide'
        ]);

        $response = $this->getJson("/api/mes-evaluations/count?user_id={$user->id}");

        $response->assertStatus(200)
                 ->assertJsonFragment(['count' => 2]);
    }
}
