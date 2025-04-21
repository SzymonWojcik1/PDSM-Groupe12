<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use App\Enums\Role;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function siege_can_create_user()
    {
        $siege = User::factory()->create(['role' => Role::SIEGE->value]);
        $token = $siege->createToken('apitoken')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson('/api/users', [
                             'nom' => 'Dupont',
                             'prenom' => 'Jean',
                             'email' => 'jean.dupont@example.com',
                             'password' => 'Password123!',
                             'password_confirmation' => 'Password123!',
                             'role' => Role::UTILISATEUR->value,
                         ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['user']);
        $this->assertDatabaseHas('users', ['email' => 'jean.dupont@example.com']);
    }

    /** @test */
    public function non_siege_cannot_create_user()
    {
        $user = User::factory()->create(['role' => Role::CN->value]);
        $token = $user->createToken('apitoken')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson('/api/users', [
                             'nom' => 'Test',
                             'prenom' => 'User',
                             'email' => 'test@example.com',
                             'password' => 'Password123!',
                             'password_confirmation' => 'Password123!',
                         ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function siege_can_update_user()
    {
        $siege = User::factory()->create(['role' => Role::SIEGE->value]);
        $token = $siege->createToken('apitoken')->plainTextToken;

        $user = User::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->putJson("/api/users/{$user->id}", [
                             'nom' => 'Modifié',
                         ]);

        $response->assertStatus(200)
                 ->assertJsonFragment(['nom' => 'Modifié']);
        $this->assertDatabaseHas('users', ['id' => $user->id, 'nom' => 'Modifié']);
    }

    /** @test */
    public function non_siege_cannot_update_user()
    {
        $user = User::factory()->create(['role' => Role::CR->value]);
        $token = $user->createToken('apitoken')->plainTextToken;

        $otherUser = User::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->putJson("/api/users/{$otherUser->id}", [
                             'nom' => 'Invalide',
                         ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function siege_can_delete_user()
    {
        $siege = User::factory()->create(['role' => Role::SIEGE->value]);
        $token = $siege->createToken('apitoken')->plainTextToken;

        $user = User::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->deleteJson("/api/users/{$user->id}");

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Utilisateur supprimé avec succès']);
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    /** @test */
    public function non_siege_cannot_delete_user()
    {
        $user = User::factory()->create(['role' => Role::CN->value]);
        $token = $user->createToken('apitoken')->plainTextToken;

        $targetUser = User::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->deleteJson("/api/users/{$targetUser->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('users', ['id' => $targetUser->id]);
    }

    /** @test */
    public function unauthenticated_user_cannot_access_user_routes()
    {
        $user = User::factory()->create();

        $this->postJson('/api/users', [])->assertStatus(401);
        $this->putJson("/api/users/{$user->id}", [])->assertStatus(401);
        $this->deleteJson("/api/users/{$user->id}")->assertStatus(401);
    }

    /** @test */
    public function siege_can_update_user_without_changing_password()
    {
        $siege = User::factory()->create(['role' => Role::SIEGE->value]);
        $token = $siege->createToken('apitoken')->plainTextToken;

        $user = User::factory()->create([
            'password' => Hash::make('OriginalPassword123!')
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                        ->putJson("/api/users/{$user->id}", [
                            'nom' => 'NouveauNom',
                            // Pas de champ "password"
                        ]);

        $response->assertStatus(200)
                ->assertJsonFragment(['nom' => 'NouveauNom']);

        $this->assertTrue(Hash::check('OriginalPassword123!', $user->fresh()->password));
    }

    /** @test */
    public function it_rejects_update_with_existing_email()
    {
        $siege = User::factory()->create(['role' => Role::SIEGE->value]);
        $token = $siege->createToken('apitoken')->plainTextToken;

        $user1 = User::factory()->create(['email' => 'original@example.com']);
        $user2 = User::factory()->create(['email' => 'duplicate@example.com']);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                        ->putJson("/api/users/{$user1->id}", [
                            'email' => 'duplicate@example.com',
                        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['email']);
    }

    /** @test */
    public function it_returns_404_when_deleting_nonexistent_user()
    {
        $siege = User::factory()->create(['role' => Role::SIEGE->value]);
        $token = $siege->createToken('apitoken')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                        ->deleteJson("/api/users/9999");

        $response->assertStatus(404);
    }
}
