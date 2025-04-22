<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Notification;
use App\Notifications\TwoFactorCodeNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_logs_in_a_user_and_sends_2fa_code()
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'yann.husmann@hes-so.ch',
            'password' => Hash::make('Password123!'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'yann.husmann@hes-so.ch',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['token', 'two_factor_required']);

        Notification::assertSentTo($user, TwoFactorCodeNotification::class);
    }

    /** @test */
    public function it_rejects_invalid_login()
    {
        $response = $this->postJson('/api/login', [
            'email' => 'inexistant@example.com',
            'password' => 'WrongPassword',
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function it_verifies_correct_two_factor_code()
    {
        $user = User::factory()->create([
            'two_factor_code' => '123456',
            'two_factor_expires_at' => now()->addMinutes(5),
        ]);

        $token = $user->createToken('apitoken')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson('/api/2fa/verify', [
                             'code' => '123456',
                         ]);

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Double authentification réussie']);
    }

    /** @test */
    public function it_rejects_invalid_two_factor_code()
    {
        $user = User::factory()->create([
            'two_factor_code' => '123456',
            'two_factor_expires_at' => now()->addMinutes(5),
        ]);

        $token = $user->createToken('apitoken')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson('/api/2fa/verify', [
                             'code' => '999999',
                         ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function it_returns_authenticated_user_profile()
    {
        $user = User::factory()->create();
        $token = $user->createToken('apitoken')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->getJson('/api/profile');

        $response->assertStatus(200)
                 ->assertJson(['email' => $user->email]);
    }

    /** @test */
    public function it_logs_out_the_user()
    {
        $user = User::factory()->create();
        $token = $user->createToken('apitoken')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson('/api/logout');

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Déconnecté avec succès']);
    }

    /** @test */
    public function it_rejects_expired_two_factor_code()
    {
        $user = User::factory()->create([
            'two_factor_code' => '654321',
            'two_factor_expires_at' => now()->subMinutes(1),
        ]);

        $token = $user->createToken('apitoken')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                        ->postJson('/api/2fa/verify', [
                            'code' => '654321',
                        ]);

        $response->assertStatus(422)
                ->assertJson(['message' => 'Code invalide ou expiré']);
    }

    /** @test */
    public function it_overwrites_old_two_factor_code_on_new_login()
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('Password123!'),
            'two_factor_code' => '111111',
            'two_factor_expires_at' => now()->addMinutes(5),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(200);

        $user->refresh();

        $this->assertNotEquals('111111', $user->two_factor_code);
        $this->assertNotNull($user->two_factor_code);
        Notification::assertSentTo($user, TwoFactorCodeNotification::class);
    }

    /** @test */
    public function it_deletes_two_factor_code_after_successful_verification()
    {
        $user = User::factory()->create([
            'two_factor_code' => '222222',
            'two_factor_expires_at' => now()->addMinutes(5),
        ]);

        $token = $user->createToken('apitoken')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                        ->postJson('/api/2fa/verify', [
                            'code' => '222222',
                        ]);

        $response->assertStatus(200)
                ->assertJson(['message' => 'Double authentification réussie']);

        $user->refresh();

        $this->assertNull($user->two_factor_code);
        $this->assertNull($user->two_factor_expires_at);
    }

    /** @test */
    public function it_rejects_login_with_missing_or_invalid_fields()
    {
        $response = $this->postJson('/api/login', [
            'email' => 'invalid-email',
            'password' => '', // vide
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['email', 'password']);
    }

    /** @test */
    public function it_rejects_2fa_verification_if_code_is_missing_or_invalid()
    {
        $user = User::factory()->create([
            'two_factor_code' => '123456',
            'two_factor_expires_at' => now()->addMinutes(5),
        ]);

        $token = $user->createToken('apitoken')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                        ->postJson('/api/2fa/verify', [
                            'code' => '', // vide
                        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['code']);
    }


}
