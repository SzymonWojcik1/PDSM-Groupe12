<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Notification;
use App\Notifications\TwoFactorCodeNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_registers_a_user()
    {
        $response = $this->postJson('/api/register', [
            'nom' => 'Husmann',
            'prenom' => 'Yann',
            'email' => 'yann.husmann@hes-so.ch',
            'password' => 'Test1234!',
            'password_confirmation' => 'Test1234!',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['user', 'token']);
        $this->assertDatabaseHas('users', ['email' => 'yann.husmann@hes-so.ch']);
    }

    /** @test */
    public function it_requires_valid_registration_data()
    {
        $response = $this->postJson('/api/register', []);
        $response->assertStatus(422);
    }

    /** @test */
    public function it_logs_in_a_user_and_sends_2fa_code()
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'yann.husmann@hes-so.ch',
            'password' => bcrypt('Password123!'),
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
            'email' => 'yann.husmann@hes-so.ch',
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
}
