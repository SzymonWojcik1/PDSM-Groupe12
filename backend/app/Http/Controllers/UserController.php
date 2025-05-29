<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Enums\Role;
use Illuminate\Support\Str;
use App\Notifications\UserCreatedNotification;
use App\Helpers\Logger;

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
              'role' => ['nullable', Rule::in(array_column(Role::cases(), 'value'))],
              'telephone' => ['nullable', 'string', 'max:20'],
              'partenaire_id' => ['nullable', 'exists:partenaires,part_id'],
              'superieur_id' => ['nullable', 'exists:users,id'],
          ]);
  
          if ($request->filled('superieur_id') && $request->filled('role')) {
              $superieur = User::find($request->superieur_id);
              if (!$superieur || !Role::isSuperior($superieur->role, $request->role)) {
                  return response()->json([
                      'message' => 'Erreur de validation',
                      'errors' => [
                          'superieur_id' => ['Le rôle du supérieur doit être hiérarchiquement supérieur.']
                      ]
                  ], 422);
              }
          }
  
          $plainPassword = Str::random(12);
  
          $user = User::create([
              'nom' => $request->nom,
              'prenom' => $request->prenom,
              'email' => $request->email,
              'password' => Hash::make($plainPassword),
              'role' => $request->role ?? 'utilisateur',
              'telephone' => $request->telephone,
              'partenaire_id' => $request->partenaire_id,
              'superieur_id' => $request->superieur_id,
          ]);
  
          $user->notify(new UserCreatedNotification($user->email, $plainPassword));
  
          Logger::log(
              'info',
              'Création utilisateur',
              'Un utilisateur a été créé',
              ['nouvel_utilisateur_id' => $user->id, 'email' => $user->email],
              auth()->id()
          );
  
          return response()->json(['user' => $user], 201);
      }
  
      public function update(Request $request, $id)
    {
        $authUser = $request->user();

        if (!$authUser || ($authUser->role !== Role::SIEGE->value && $authUser->id != $id)) {
            return response()->json(['message' => 'Accès interdit'], 403);
        }

        $user = User::findOrFail($id);

        $request->validate([
            'nom' => ['sometimes', 'string', 'max:255', 'regex:/^[\p{L}\'\-\s]+$/u'],
            'prenom' => ['sometimes', 'string', 'max:255', 'regex:/^[\p{L}\'\-\s]+$/u'],
            'email' => ['sometimes', 'string', 'email', Rule::unique('users')->ignore($user->id)],
            'role' => ['sometimes', Rule::in(array_column(Role::cases(), 'value'))],
            'telephone' => ['nullable', 'string', 'max:20'],
            'partenaire_id' => ['nullable', 'exists:partenaires,part_id'],
            'superieur_id' => ['nullable', 'exists:users,id'],
        ]);

        $newRole = $request->role ?? $user->role;
        $newSuperieurId = $request->superieur_id ?? $user->superieur_id;

        if (($request->has('role') || $request->has('superieur_id')) && $newSuperieurId) {
            $superieur = User::find($newSuperieurId);
            if (!$superieur || !Role::isSuperior($superieur->role, $newRole)) {
                return response()->json([
                    'message' => 'Erreur de validation',
                    'errors' => [
                        'superieur_id' => ['Le rôle du supérieur doit être hiérarchiquement supérieur.']
                    ]
                ], 422);
            }
        }

        $user->update([
            'nom' => $request->nom ?? $user->nom,
            'prenom' => $request->prenom ?? $user->prenom,
            'email' => $request->email ?? $user->email,
            'role' => $newRole,
            'telephone' => $request->telephone ?? $user->telephone,
            'partenaire_id' => $request->partenaire_id ?? $user->partenaire_id,
            'superieur_id' => $newSuperieurId,
        ]);

        Logger::log(
            'info',
            'Mise à jour utilisateur',
            'Un utilisateur a été modifié',
            ['modifié_id' => $user->id, 'email' => $user->email],
            auth()->id()
        );

        return response()->json(['message' => 'Utilisateur mis à jour avec succès', 'user' => $user]);
    }

    public function destroy(Request $request, $id)
    {
        if (!$request->user() || $request->user()->role !== Role::SIEGE->value) {
            return response()->json(['message' => 'Accès interdit'], 403);
        }

        $user = User::findOrFail($id);
        $user->delete();

        Logger::log(
            'info',
            'Suppression utilisateur',
            'Un utilisateur a été supprimé',
            ['supprimé_id' => $user->id, 'email' => $user->email],
            auth()->id()
        );

        return response()->json(['message' => 'Utilisateur supprimé avec succès']);
    }

    public function assignPartenaire(Request $request, $id)
    {
        if (!$request->user() || $request->user()->role !== Role::SIEGE->value) {
            return response()->json(['message' => 'Accès interdit'], 403);
        }

        $request->validate([
            'partenaire_id' => ['required', 'exists:partenaires,part_id'],
        ]);

        $user = User::findOrFail($id);
        $user->partenaire_id = $request->partenaire_id;
        $user->save();

        return response()->json(['message' => 'Partenaire assigné avec succès', 'user' => $user]);
    }

    public function index(Request $request)
    {
        if (!$request->user() || $request->user()->role !== Role::SIEGE->value) {
            return response()->json(['message' => 'Accès interdit'], 403);
        }

        $query = User::with(['partenaire', 'superieur']);

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('partenaire_id')) {
            $query->where('partenaire_id', $request->partenaire_id);
        }

        if ($request->has('superieur_id')) {
            $query->where('superieur_id', $request->superieur_id);
        }

        return response()->json($query->get());
    }

    public function show(Request $request, $id)
    {
        if (!$request->user() || $request->user()->role !== Role::SIEGE->value) {
            return response()->json(['message' => 'Accès interdit'], 403);
        }

        return response()->json(
            User::with(['partenaire', 'superieur'])->findOrFail($id)
        );
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load(['partenaire', 'superieur']));
    }
}
