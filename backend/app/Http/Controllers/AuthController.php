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
    public function login(Request $request)
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            Logger::log(
                'warning',
                'Échec de connexion',
                'Tentative de connexion avec identifiants incorrects',
                ['email' => $request->email],
                $user->id
            );

            throw ValidationException::withMessages([
                'email' => ['Identifiants incorrects.'],
            ]);
        }

        // Génération du token d'auth
        $token = $user->createToken('apitoken')->plainTextToken;

        // Gestion de la double authentification
        $code = rand(100000, 999999);
        $user->two_factor_code = $code;
        $user->two_factor_expires_at = now()->addMinutes(10);
        $user->save();

        $user->notify(new TwoFactorCodeNotification($code));

        Logger::log(
            'info',
            'Connexion réussie',
            'Utilisateur connecté, code 2FA envoyé',
            ['email' => $user->email],
            $user->id
        );


        return response()->json([
            'token' => $token,
            'two_factor_required' => true
        ]);
    }

    public function verifyTwoFactorCode(Request $request)
    {
        $request->validate([
            'code' => ['required', 'numeric']
        ]);

        $user = $request->user();

        if (
            !$user->two_factor_code ||
            $user->two_factor_code !== $request->code ||
            now()->gt($user->two_factor_expires_at)
        ) {
            Logger::log(
                'warning',
                'Échec 2FA',
                'Code 2FA incorrect ou expiré',
                ['user_id' => $user->id, 'code_saisi' => $request->code],
                $user->id
            );

            return response()->json(['message' => 'Code invalide ou expiré'], 422);
        }

        // Invalidation du code
        $user->two_factor_code = null;
        $user->two_factor_expires_at = null;
        $user->save();

        Logger::log(
            'info',
            '2FA vérifié',
            'Double authentification réussie',
            ['user_id' => $user->id],
            $user->id
        );

        return response()->json(['message' => 'Double authentification réussie']);
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        $user->currentAccessToken()->delete();

        Logger::log(
            'info',
            'Déconnexion',
            'Utilisateur déconnecté',
            ['user_id' => $user->id],
            $user->id
        );

        return response()->json([
            'message' => 'Déconnecté avec succès'
        ]);
    }

    public function profile(Request $request)
    {
        return response()->json($request->user());
    }
}
