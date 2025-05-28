<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Notifications\TwoFactorCodeNotification;
use App\Enums\Role;
use Illuminate\Validation\Rule;
use App\Helpers\Logger;

class AuthController extends Controller
{
    /**
     * Login method to authenticate users and handle two-factor authentication.
     */
    public function login(Request $request)
    {
        // Validate the request data: email and password are required
        $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        // Attempt to find the user by email
        $user = User::where('email', $request->email)->first();

        // If user not found or password does not match, log the attempt and throw validation exception
        if (!$user || !Hash::check($request->password, $user->password)) {
            Logger::log(
                'warning',
                'Échec de connexion', // Login failed
                'Tentative de connexion avec identifiants incorrects', // Attempted login with incorrect credentials
                ['email' => $request->email],
                $user->id
            );

            throw ValidationException::withMessages([
                'email' => ['Identifiants incorrects.'], // Incorrect credentials
            ]);
        }

        // Create a new API token for the user
        $token = $user->createToken('apitoken')->plainTextToken;

        // Generate a 6-digit two-factor authentication code
        $code = rand(100000, 999999);
        $user->two_factor_code = $code;
        $user->two_factor_expires_at = now()->addMinutes(10); // Code expires in 10 minutes
        $user->save();

        // Send the 2FA code to the user via notification
        $user->notify(new TwoFactorCodeNotification($code));

        // Log the successful login and 2FA code sending
        Logger::log(
            'info',
            'Connexion réussie', // Login successful
            'Utilisateur connecté, code 2FA envoyé', // User logged in, 2FA code sent
            ['email' => $user->email],
            $user->id
        );

        // Return the token, 2FA requirement, and user role in the response
        return response()->json([
            'token' => $token,
            'two_factor_required' => true,
            'user' => [
                'role' => $user->role,
            ]
        ]);
    }

    /**
     * Verify the two-factor authentication code provided by the user.
     */
    public function verifyTwoFactorCode(Request $request)
    {
        // Validate the request: code is required and must be numeric
        $request->validate([
            'code' => ['required', 'numeric']
        ]);

        // Get the currently authenticated user
        $user = $request->user();

        // Check if the 2FA code is missing, incorrect, or expired
        if (
            !$user->two_factor_code ||
            $user->two_factor_code !== $request->code ||
            now()->gt($user->two_factor_expires_at)
        ) {
            // Log the failed 2FA attempt
            Logger::log(
                'warning',
                'Échec 2FA', // 2FA failed
                'Code 2FA incorrect ou expiré', // 2FA code incorrect or expired
                ['user_id' => $user->id, 'code_saisi' => $request->code],
                $user->id
            );

            // Return error response for invalid or expired code
            return response()->json(['message' => 'Code invalide ou expiré'], 422);
        }

        // Invalidate the 2FA code after successful verification
        $user->two_factor_code = null;
        $user->two_factor_expires_at = null;
        $user->save();

        // Log the successful 2FA verification
        Logger::log(
            'info',
            '2FA vérifié', // 2FA verified
            'Double authentification réussie', // Two-factor authentication successful
            ['user_id' => $user->id],
            $user->id
        );

        // Return success response with user role
        return response()->json([
            'message' => 'Double authentification réussie',
            'user' => [
                'role' => $user->role,
            ]
        ]);
    }

    /**
     * Logout method to invalidate the user's access token.
     */
    public function logout(Request $request)
    {
        // Get the currently authenticated user
        $user = $request->user();

        // Delete the current access token (logout)
        $user->currentAccessToken()->delete();

        // Log the logout event
        Logger::log(
            'info',
            'Déconnexion', // Logout
            'Utilisateur déconnecté', // User logged out
            ['user_id' => $user->id],
            $user->id
        );

        // Return success response for logout
        return response()->json([
            'message' => 'Déconnecté avec succès'
        ]);
    }

    /**
     * Get the authenticated user's profile data.
     */
    public function profile(Request $request)
    {
        // Return the authenticated user's profile data
        return response()->json($request->user());
    }
}
