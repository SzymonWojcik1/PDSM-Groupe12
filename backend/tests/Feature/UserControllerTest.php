<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use App\Enums\Role;
use App\Models\Partenaire;


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

    /** @test */
    public function it_rejects_invalid_characters_in_nom_or_prenom()
    {
        $siege = User::factory()->create(['role' => Role::SIEGE->value]);
        $token = $siege->createToken('apitoken')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/users', [
                'nom' => 'Dupont123!',
                'prenom' => 'Jean@',
                'email' => 'invalidchars@example.com',
                'password' => 'Password123!',
                'password_confirmation' => 'Password123!',
            ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['nom', 'prenom']);
    }

    /** @test */
    public function it_rejects_weak_password_on_update()
    {
        $siege = User::factory()->create(['role' => Role::SIEGE->value]);
        $token = $siege->createToken('apitoken')->plainTextToken;
        $user = User::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                        ->putJson("/api/users/{$user->id}", [
                            'password' => 'weakpass',
                            'password_confirmation' => 'weakpass',
                        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['password']);
    }

    /** @test */
    public function it_assigns_default_role_utilisateur_if_not_specified()
    {
        $siege = User::factory()->create(['role' => Role::SIEGE->value]);
        $token = $siege->createToken('apitoken')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                        ->postJson('/api/users', [
                            'nom' => 'Nom',
                            'prenom' => 'Prenom',
                            'email' => 'defaultrole@example.com',
                            'password' => 'Password123!',
                            'password_confirmation' => 'Password123!',
                        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'email' => 'defaultrole@example.com',
            'role' => 'utilisateur',
        ]);
    }

    /** @test */
    public function it_rejects_invalid_role_on_create_or_update()
    {
        $siege = User::factory()->create(['role' => Role::SIEGE->value]);
        $token = $siege->createToken('apitoken')->plainTextToken;
        $user = User::factory()->create();

        // Création
        $create = $this->withHeader('Authorization', 'Bearer ' . $token)
                    ->postJson('/api/users', [
                        'nom' => 'Test',
                        'prenom' => 'Invalide',
                        'email' => 'invalidrole@example.com',
                        'password' => 'Password123!',
                        'password_confirmation' => 'Password123!',
                        'role' => 'HACKER',
                    ]);
        $create->assertStatus(422)->assertJsonValidationErrors(['role']);

        // Mise à jour
        $update = $this->withHeader('Authorization', 'Bearer ' . $token)
                    ->putJson("/api/users/{$user->id}", [
                        'role' => 'INVALID_ROLE',
                    ]);
        $update->assertStatus(422)->assertJsonValidationErrors(['role']);
    }

    /** @test */
    public function it_accepts_apostrophes_and_hyphens_in_nom_and_prenom()
    {
        $siege = User::factory()->create(['role' => Role::SIEGE->value]);
        $token = $siege->createToken('apitoken')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                        ->postJson('/api/users', [
                            'nom' => "O'Connor",
                            'prenom' => "Jean-Luc",
                            'email' => 'jean.luc@example.com',
                            'password' => 'Password123!',
                            'password_confirmation' => 'Password123!',
                        ]);

        $response->assertStatus(201)
                ->assertJsonStructure(['user']);

        $this->assertDatabaseHas('users', [
            'email' => 'jean.luc@example.com',
            'nom' => "O'Connor",
            'prenom' => "Jean-Luc",
        ]);
    }

    /** @test */
    public function siege_can_assign_partenaire_via_dedicated_route()
    {
        $siege = User::factory()->create(['role' => Role::SIEGE->value]);
        $token = $siege->createToken('apitoken')->plainTextToken;

        $user = User::factory()->create(['partenaire_id' => null]);
        $partenaire = \App\Models\Partenaire::factory()->create();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                        ->postJson("/api/users/{$user->id}/partenaire", [
                            'partenaire_id' => $partenaire->part_id,
                        ]);

        $response->assertStatus(200)
                ->assertJsonFragment([
                    'partenaire_id' => $partenaire->part_id,
                ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'partenaire_id' => $partenaire->part_id,
        ]);
    }

    /** @test */
    public function siege_can_create_user_with_superieur_id()
    {
        $siege = User::factory()->create(['role' => Role::SIEGE->value]);
        $cr = User::factory()->create(['role' => Role::CR->value]);
        $token = $siege->createToken('apitoken')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/users', [
                'nom' => 'Jean',
                'prenom' => 'CN',
                'email' => 'jean.cn@example.com',
                'password' => 'Password123!',
                'password_confirmation' => 'Password123!',
                'role' => Role::CN->value,
                'superieur_id' => $cr->id
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'jean.cn@example.com', 'superieur_id' => $cr->id]);
    }

    /** @test */
    public function siege_can_update_user_superieur_id()
    {
        $siege = User::factory()->create(['role' => Role::SIEGE->value]);
        $cr = User::factory()->create(['role' => Role::CR->value]);
        $cn = User::factory()->create(['role' => Role::CN->value, 'superieur_id' => null]);
        $token = $siege->createToken('apitoken')->plainTextToken;

        $res = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/users/{$cn->id}", [
                'superieur_id' => $cr->id,
            ]);

        $res->assertStatus(200);
        $this->assertDatabaseHas('users', ['id' => $cn->id, 'superieur_id' => $cr->id]);
    }

    /** @test */
    public function siege_cannot_set_invalid_superieur_id()
    {
        $siege = User::factory()->create(['role' => Role::SIEGE->value]);
        $cn = User::factory()->create(['role' => Role::CN->value]);
        $token = $siege->createToken('apitoken')->plainTextToken;

        $res = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/users/{$cn->id}", [
                'superieur_id' => 99999, // inexistant
            ]);

        $res->assertStatus(422)->assertJsonValidationErrors(['superieur_id']);
    }

    /** @test */
    public function siege_can_filter_users_by_superieur_id()
    {
        $siege = User::factory()->create(['role' => Role::SIEGE->value]);
        $cr = User::factory()->create(['role' => Role::CR->value]);
        $cn1 = User::factory()->create(['role' => Role::CN->value, 'superieur_id' => $cr->id]);
        $cn2 = User::factory()->create(['role' => Role::CN->value, 'superieur_id' => null]);
        $token = $siege->createToken('apitoken')->plainTextToken;

        $res = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson("/api/users?superieur_id={$cr->id}");

        $res->assertStatus(200)
            ->assertJsonFragment(['id' => $cn1->id])
            ->assertJsonMissing(['id' => $cn2->id]);
    }

    /** @test */
    public function siege_can_filter_users_by_role()
    {
        $siege = User::factory()->create(['role' => Role::SIEGE->value]);
        $cn = User::factory()->create(['role' => Role::CN->value]);
        $cr = User::factory()->create(['role' => Role::CR->value]);
        $token = $siege->createToken('apitoken')->plainTextToken;

        $res = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson("/api/users?role=cn");

        $res->assertStatus(200)
            ->assertJsonFragment(['id' => $cn->id])
            ->assertJsonMissing(['id' => $cr->id]);
    }

    /** @test */
    public function siege_can_filter_users_by_partenaire_id()
    {
        $siege = User::factory()->create(['role' => Role::SIEGE->value]);
        $partenaire = Partenaire::factory()->create();
        $u1 = User::factory()->create(['partenaire_id' => $partenaire->part_id]);
        $u2 = User::factory()->create(['partenaire_id' => null]);
        $token = $siege->createToken('apitoken')->plainTextToken;

        $res = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson("/api/users?partenaire_id={$partenaire->part_id}");

        $res->assertStatus(200)
            ->assertJsonFragment(['id' => $u1->id])
            ->assertJsonMissing(['id' => $u2->id]);
    }

    /** @test */
    public function it_rejects_superieur_with_equal_or_lower_role_on_create()
    {
        $siege = User::factory()->create(['role' => Role::SIEGE->value]);
        $cn = User::factory()->create(['role' => Role::CN->value]);
        $token = $siege->createToken('apitoken')->plainTextToken;

        // Superieur avec rôle égal
        $res1 = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/users', [
                'nom' => 'Jean',
                'prenom' => 'Test',
                'email' => 'equal@example.com',
                'password' => 'Password123!',
                'password_confirmation' => 'Password123!',
                'role' => Role::CN->value,
                'superieur_id' => $cn->id
            ]);

        $res1->assertStatus(422)->assertJsonValidationErrors(['superieur_id']);

        // Superieur avec rôle inférieur
        $utilisateur = User::factory()->create(['role' => Role::UTILISATEUR->value]);

        $res2 = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/users', [
                'nom' => 'Jean',
                'prenom' => 'Test',
                'email' => 'lower@example.com',
                'password' => 'Password123!',
                'password_confirmation' => 'Password123!',
                'role' => Role::CN->value,
                'superieur_id' => $utilisateur->id
            ]);

        $res2->assertStatus(422)->assertJsonValidationErrors(['superieur_id']);
    }

    /** @test */
    public function it_allows_valid_superior_on_create()
    {
        $siege = User::factory()->create(['role' => Role::SIEGE->value]);
        $cr = User::factory()->create(['role' => Role::CR->value]);
        $token = $siege->createToken('apitoken')->plainTextToken;

        $res = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/users', [
                'nom' => 'Jean',
                'prenom' => 'Test',
                'email' => 'valid.superior@example.com',
                'password' => 'Password123!',
                'password_confirmation' => 'Password123!',
                'role' => Role::CN->value,
                'superieur_id' => $cr->id
            ]);

        $res->assertStatus(201)
            ->assertJsonFragment([
                'email' => 'valid.superior@example.com',
                'superieur_id' => $cr->id,
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'valid.superior@example.com',
            'superieur_id' => $cr->id,
        ]);
    }

    /** @test */
    public function it_rejects_invalid_superior_on_update()
    {
        $siege = User::factory()->create(['role' => Role::SIEGE->value]);
        $cn = User::factory()->create(['role' => Role::CN->value]);
        $utilisateur = User::factory()->create(['role' => Role::UTILISATEUR->value]);
        $token = $siege->createToken('apitoken')->plainTextToken;

        $res = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/users/{$cn->id}", [
                'superieur_id' => $utilisateur->id,
            ]);

        $res->assertStatus(422)->assertJsonValidationErrors(['superieur_id']);
    }

    /** @test */
    public function it_allows_valid_superior_on_update()
    {
        $siege = User::factory()->create(['role' => Role::SIEGE->value]);
        $cr = User::factory()->create(['role' => Role::CR->value]);
        $cn = User::factory()->create(['role' => Role::CN->value, 'superieur_id' => null]);
        $token = $siege->createToken('apitoken')->plainTextToken;

        $res = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/users/{$cn->id}", [
                'superieur_id' => $cr->id,
            ]);

        $res->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $cn->id,
            'superieur_id' => $cr->id,
        ]);
    }


}
