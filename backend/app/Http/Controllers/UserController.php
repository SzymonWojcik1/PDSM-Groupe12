<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Enums\Role;

class UserController extends Controller
{
    public function store(Request $request)
    {
        if (!$request->user() || $request->user()->role !== Role::SIEGE->value) {
            return response()->json(['message' => 'Accès interdit'], 403);
        }

        $request->validate([
            'nom' => ['required', 'string', 'max:255', 'regex:/^[\p{L}\'\-\s]+$/u'],
            'prenom' => ['required', 'string', 'max:255', 'regex:/^[\p{L}\'\-\s]+$/u'],
            'email' => ['required', 'string', 'email', 'unique:users,email'],
            'password' => [
                'required', 'string', 'confirmed', 'min:8',
                'regex:/[A-Z]/', 'regex:/[!@#$%^&*(),.?":{}|<>]/'
            ],
            'role' => ['nullable', Rule::in(array_column(Role::cases(), 'value'))],
            'telephone' => ['nullable', 'string', 'max:20'],
        ]);

        $user = User::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'utilisateur',
            'telephone' => $request->telephone,
        ]);

        return response()->json(['user' => $user], 201);
    }

    public function update(Request $request, $id)
    {
        if (!$request->user() || $request->user()->role !== Role::SIEGE->value) {
            return response()->json(['message' => 'Accès interdit'], 403);
        }

        $user = User::findOrFail($id);

        $request->validate([
            'nom' => ['sometimes', 'string', 'max:255', 'regex:/^[\p{L}\'\-\s]+$/u'],
            'prenom' => ['sometimes', 'string', 'max:255', 'regex:/^[\p{L}\'\-\s]+$/u'],
            'email' => ['sometimes', 'string', 'email', Rule::unique('users')->ignore($user->id)],
            'password' => [
                'nullable', 'string', 'confirmed', 'min:8',
                'regex:/[A-Z]/', 'regex:/[!@#$%^&*(),.?":{}|<>]/'
            ],
            'role' => ['sometimes', Rule::in(array_column(Role::cases(), 'value'))],
            'telephone' => ['nullable', 'string', 'max:20'],
        ]);

        $user->update([
            'nom' => $request->nom ?? $user->nom,
            'prenom' => $request->prenom ?? $user->prenom,
            'email' => $request->email ?? $user->email,
            'password' => $request->filled('password') ? Hash::make($request->password) : $user->password,
            'role' => $request->role ?? $user->role,
            'telephone' => $request->telephone ?? $user->telephone,
        ]);

        return response()->json(['message' => 'Utilisateur mis à jour avec succès', 'user' => $user]);
    }

    public function destroy(Request $request, $id)
    {
        if (!$request->user() || $request->user()->role !== Role::SIEGE->value) {
            return response()->json(['message' => 'Accès interdit'], 403);
        }

        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé avec succès']);
    }
}
