<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Hash;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Notifications\ResetPasswordNotification;

class PasswordResetControllerTest extends TestCase
{
    use RefreshDatabase;

    protected string $email = 'yann.husmann@hes-so.ch';

    /** @test */
    public function it_sends_a_password_reset_link_to_valid_email()
    {
        Notification::fake();

        $user = User::factory()->create(['email' => $this->email]);

        $response = $this->postJson('/api/password/forgot', [
            'email' => $this->email,
        ]);

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Lien envoyé par e-mail.']);

        Notification::assertSentTo($user, ResetPasswordNotification::class);
    }

    /** @test */
    public function it_fails_to_send_reset_link_to_nonexistent_email()
    {
        Notification::fake();

        $response = $this->postJson('/api/password/forgot', [
            'email' => 'nonexistent@example.com',
        ]);

        $response->assertStatus(400)
                 ->assertJson(['message' => 'Impossible d’envoyer le lien.']);

        Notification::assertNothingSent();
    }

    /** @test */
    public function it_resets_password_with_valid_token()
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => $this->email,
            'password' => Hash::make('OldPassword123!')
        ]);

        $token = Password::broker()->createToken($user);

        $response = $this->postJson('/api/password/reset', [
            'email' => $this->email,
            'token' => $token,
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Mot de passe réinitialisé avec succès.']);

        $this->assertTrue(Hash::check('NewPassword123!', $user->fresh()->password));
    }

    /** @test */
    public function it_fails_reset_with_invalid_token()
    {
        $user = User::factory()->create([
            'email' => $this->email,
            'password' => Hash::make('OldPassword123!')
        ]);

        $response = $this->postJson('/api/password/reset', [
            'email' => $this->email,
            'token' => 'invalid-token',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertStatus(400)
                 ->assertJson(['message' => 'Échec de la réinitialisation.']);
    }

    /** @test */
    public function it_fails_reset_with_weak_password()
    {
        $user = User::factory()->create([
            'email' => $this->email,
        ]);

        $token = Password::broker()->createToken($user);

        $response = $this->postJson('/api/password/reset', [
            'email' => $this->email,
            'token' => $token,
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['password']);
    }

    /** @test */
    public function it_fails_when_password_confirmation_does_not_match()
    {
        $user = User::factory()->create([
            'email' => $this->email,
        ]);

        $token = Password::broker()->createToken($user);

        $response = $this->postJson('/api/password/reset', [
            'email' => $this->email,
            'token' => $token,
            'password' => 'Password123!',
            'password_confirmation' => 'WrongConfirmation!',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['password']);
    }
}
