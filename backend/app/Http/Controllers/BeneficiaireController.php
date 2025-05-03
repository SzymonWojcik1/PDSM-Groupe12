<?php

namespace App\Http\Controllers;

use App\Models\Beneficiaire;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;
use App\Enums\Type;
use App\Enums\Zone;
use App\Enums\Sexe;
use App\Enums\Genre;
use Carbon\Carbon;


class BeneficiaireController extends Controller
{
    public function index(Request $request)
    {
        $beneficiaires = Beneficiaire::query()
            ->when($request->region, fn($q) => $q->where('ben_region', $request->region))
            ->when($request->pays, fn($q) => $q->where('ben_pays', $request->pays))
            ->when($request->zone, fn($q) => $q->where('ben_zone', $request->zone))
            ->when($request->type, fn($q) => $q->where('ben_type', $request->type))
            ->when($request->sexe, fn($q) => $q->where('ben_sexe', $request->sexe))
            ->when($request->genre, fn($q) => $q->where('ben_genre', $request->genre))
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('ben_prenom', 'like', "%$search%")
                      ->orWhere('ben_nom', 'like', "%$search%");
                });
            })
            ->get();

        return response()->json($beneficiaires);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ben_prenom' => 'required|string|max:50',
            'ben_nom' => 'required|string|max:50',
            'ben_date_naissance' => 'required|date',
            'ben_region' => 'required|string',
            'ben_pays' => 'required|string',
            'ben_type' => ['required', new Enum(Type::class)],
            'ben_type_autre' => 'nullable|string',
            'ben_zone' => ['required', new Enum(Zone::class)],
            'ben_sexe' => ['required', new Enum(Sexe::class)],
            'ben_sexe_autre' => 'nullable|string',
            'ben_genre' => ['nullable', new Enum(Genre::class)],
            'ben_genre_autre' => 'nullable|string',
            'ben_ethnicite' => 'required|string',
        ]);

        $errors = [];

        if ($validated['ben_type'] === Type::AUTRE->value && empty($validated['ben_type_autre'])) {
            $errors['ben_type_autre'] = 'Champ requis si type est "Autre"';
        }

        if ($validated['ben_sexe'] === Sexe::AUTRE->value && empty($validated['ben_sexe_autre'])) {
            $errors['ben_sexe_autre'] = 'Champ requis si sexe est "Autre"';
        }

        if (
            isset($validated['ben_genre']) &&
            $validated['ben_genre'] === Genre::AUTRE->value &&
            empty($validated['ben_genre_autre'])
        ) {
            $errors['ben_genre_autre'] = 'Champ requis si genre est "Autre"';
        }

        $age = Carbon::parse($validated['ben_date_naissance'])->age;

        if ($validated['ben_type'] === Type::ENFANT->value && !($age >= 5 && $age <= 17)) {
            $errors['ben_date_naissance'] = 'Un enfant doit avoir entre 5 et 17 ans.';
        }

        if ($validated['ben_type'] === Type::JEUNE->value && !($age >= 18 && $age <= 30)) {
            $errors['ben_date_naissance'] = 'Un jeune doit avoir entre 18 et 30 ans.';
        }

        if (!empty($errors)) {
            return response()->json(['errors' => $errors], 422);
        }

        $validated['ben_type'] = Type::from($validated['ben_type']);
        $validated['ben_zone'] = Zone::from($validated['ben_zone']);
        $validated['ben_sexe'] = Sexe::from($validated['ben_sexe']);
        if (!empty($validated['ben_genre'])) {
            $validated['ben_genre'] = Genre::from($validated['ben_genre']);
        }

        $beneficiaire = Beneficiaire::create($validated);

        return response()->json($beneficiaire, 201);
    }

    public function show(string $id)
    {
        $b = Beneficiaire::findOrFail($id);

        return response()->json($b);
    }

    public function update(Request $request, string $id)
    {
        $beneficiaire = Beneficiaire::findOrFail($id);

        $validated = $request->validate([
            'ben_prenom' => 'required|string|max:50',
            'ben_nom' => 'required|string|max:50',
            'ben_date_naissance' => 'required|date',
            'ben_region' => 'required|string',
            'ben_pays' => 'required|string',
            'ben_type' => ['required', new Enum(Type::class)],
            'ben_type_autre' => 'nullable|string',
            'ben_zone' => ['required', new Enum(Zone::class)],
            'ben_sexe' => ['required', new Enum(Sexe::class)],
            'ben_sexe_autre' => 'nullable|string',
            'ben_genre' => ['nullable', new Enum(Genre::class)],
            'ben_genre_autre' => 'nullable|string',
            'ben_ethnicite' => 'required|string',
        ]);

        $errors = [];

        if ($validated['ben_type'] === Type::AUTRE->value && empty($validated['ben_type_autre'])) {
            $errors['ben_type_autre'] = 'Champ requis si type est "Autre"';
        }

        if ($validated['ben_sexe'] === Sexe::AUTRE->value && empty($validated['ben_sexe_autre'])) {
            $errors['ben_sexe_autre'] = 'Champ requis si sexe est "Autre"';
        }

        if (
            isset($validated['ben_genre']) &&
            $validated['ben_genre'] === Genre::AUTRE->value &&
            empty($validated['ben_genre_autre'])
        ) {
            $errors['ben_genre_autre'] = 'Champ requis si genre est "Autre"';
        }

        $age = Carbon::parse($validated['ben_date_naissance'])->age;

        if ($validated['ben_type'] === Type::ENFANT->value && !($age >= 5 && $age <= 17)) {
            $errors['ben_date_naissance'] = 'Un enfant doit avoir entre 5 et 17 ans.';
        }

        if ($validated['ben_type'] === Type::JEUNE->value && !($age >= 18 && $age <= 30)) {
            $errors['ben_date_naissance'] = 'Un jeune doit avoir entre 18 et 30 ans.';
        }

        if (!empty($errors)) {
            return response()->json(['errors' => $errors], 422);
        }

        $validated['ben_type'] = Type::from($validated['ben_type']);
        $validated['ben_zone'] = Zone::from($validated['ben_zone']);
        $validated['ben_sexe'] = Sexe::from($validated['ben_sexe']);
        if (!empty($validated['ben_genre'])) {
            $validated['ben_genre'] = Genre::from($validated['ben_genre']);
        }

        $beneficiaire->update($validated);

        return response()->json($beneficiaire);
    }

    public function destroy(string $id)
    {
        $beneficiaire = Beneficiaire::findOrFail($id);
        $beneficiaire->delete();

        return response()->json(['message' => 'Bénéficiaire supprimé avec succès']);
    }
    public function checkDuplicate(Request $request)
    {
        $validated = $request->validate([
            'ben_nom' => 'required|string|max:50',
            'ben_prenom' => 'required|string|max:50',
            'ben_date_naissance' => 'required|date',
            'ben_sexe' => ['required', new Enum(Sexe::class)],
        ]);

        $duplicate = Beneficiaire::where('ben_nom', $validated['ben_nom'])
            ->where('ben_prenom', $validated['ben_prenom'])
            ->where('ben_date_naissance', $validated['ben_date_naissance'])
            ->where('ben_sexe', $validated['ben_sexe']) // bien prendre l'enum brut
            ->first();

        if ($duplicate) {
            return response()->json([
                'exists' => true,
                'beneficiaire' => [
                    'id' => $duplicate->id,
                    'nom' => $duplicate->ben_nom,
                    'prenom' => $duplicate->ben_prenom,
                    'created_at' => $duplicate->created_at->format('d/m/Y'),
                ]
            ]);
        }

        return response()->json(['exists' => false]);
    }
}
