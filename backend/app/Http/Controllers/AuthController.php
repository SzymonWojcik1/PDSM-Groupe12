<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Notifications\TwoFactorCodeNotification;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'nom' => ['required', 'string', 'max:255', 'regex:/^[\p{L}\'\-\s]+$/u'],
            'prenom' => ['required', 'string', 'max:255', 'regex:/^[\p{L}\'\-\s]+$/u'],
            'email' => ['required', 'string', 'email:rfc,dns', 'unique:users,email'],
            'password' => [
                'required',
                'string',
                'confirmed',
                'min:8',
                'regex:/[A-Z]/',
                'regex:/[!@#$%^&*(),.?":{}|<>]/'
            ],
            'role' => ['nullable', 'string'],
            'telephone' => ['nullable', 'string', 'max:20'],
        ],
        [
            'password.regex' => 'Le mot de passe doit contenir au moins 8 caractères, une majuscule et un caractère spécial.',
            'nom.regex' => 'Le nom ne peut contenir que des lettres, apostrophes ou tirets.',
            'prenom.regex' => 'Le prénom ne peut contenir que des lettres, apostrophes ou tirets.',
        ]);

        $user = User::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'utilisateur',
            'telephone' => $request->telephone,
        ]);

        $token = $user->createToken('apitoken')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
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
            return response()->json(['message' => 'Code invalide ou expiré'], 422);
        }

        // Invalidation du code
        $user->two_factor_code = null;
        $user->two_factor_expires_at = null;
        $user->save();

        return response()->json(['message' => 'Double authentification réussie']);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnecté avec succès'
        ]);
    }

    public function profile(Request $request)
    {
        return response()->json($request->user());
    }
}
