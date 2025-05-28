<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;
use App\Models\User;
use App\Helpers\Logger;

class PasswordResetController extends Controller
{
    /**
     * Send a password reset link to the provided email.
     */
    public function sendResetLink(Request $request)
    {
        // Validate the request: email is required and must be a valid email address
        $request->validate(['email' => 'required|email']);

        // Attempt to send the password reset link to the given email
        $status = Password::sendResetLink(
            $request->only('email')
        );

        // Try to retrieve the user to log their ID if available
        $user = User::where('email', $request->email)->first();

        // If the reset link was sent successfully
        if ($status === Password::RESET_LINK_SENT) {
            Logger::log(
                'info',
                'Envoi lien réinitialisation', // Password reset link sent
                'Lien de réinitialisation envoyé par email', // Reset link sent by email
                ['email' => $request->email],
                $user?->id // Use null-safe operator in case user is not found
            );

            // Return a success response
            return response()->json(['message' => 'Lien envoyé par e-mail.']);
        } else {
            // Log the failure to send the reset link
            Logger::log(
                'info',
                'Échec envoi lien réinitialisation', // Failed to send reset link
                'Échec de l’envoi du lien de réinitialisation', // Failed to send reset link
                ['email' => $request->email],
                $user?->id // Use null-safe operator in case user is not found
            );

            // Return an error response
            return response()->json(['message' => 'Impossible d’envoyer le lien.'], 400);
        }
    }

    /**
     * Handle the password reset request.
     */
    public function resetPassword(Request $request)
    {
        // Validate the request: email, token, and password (with confirmation and rules) are required
        $request->validate([
            'email' => 'required|email',
            'token' => 'required',
            'password' => [
                'required',
                'confirmed',
                'min:8',
                'regex:/[A-Z]/', // Must contain an uppercase letter
                'regex:/[!@#$%^&*(),.?":{}|<>]/' // Must contain a special character
            ],
        ]);

        // Prepare a reference to the user for later use
        $userRef = null;

        // Attempt to reset the user's password
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) use (&$userRef) {
                // Update the user's password and remember token
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                $userRef = $user; // Save the user for logging outside closure

                // Log the successful password reset
                Logger::log(
                    'info',
                    'Mot de passe réinitialisé', // Password reset
                    'Réinitialisation réussie', // Reset successful
                    ['email' => $user->email],
                    $user->id
                );

                // Fire the password reset event
                event(new PasswordReset($user));
            }
        );

        // If the password was reset successfully
        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
        } else {
            // Attempt to retrieve the user (if not already available) for logging
            $user = $userRef ?? User::where('email', $request->email)->first();

            // Log the failed password reset attempt
            Logger::log(
                'info',
                'Échec réinitialisation mot de passe', // Password reset failed
                'La réinitialisation a échoué', // Reset failed
                ['email' => $request->email],
                $user?->id // Use null-safe operator
            );

            // Return an error response
            return response()->json(['message' => 'Échec de la réinitialisation.'], 400);
        }
    }
}
