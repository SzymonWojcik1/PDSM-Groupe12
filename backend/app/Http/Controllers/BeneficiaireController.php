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
    // Returns a list of beneficiaries, filtered by request parameters if provided
    public function index(Request $request)
    {
        $beneficiaires = Beneficiaire::query()
            // Filter by region if present
            ->when($request->region, fn($q) => $q->where('ben_region', $request->region))
            // Filter by country if present
            ->when($request->pays, fn($q) => $q->where('ben_pays', $request->pays))
            // Filter by zone if present
            ->when($request->zone, fn($q) => $q->where('ben_zone', $request->zone))
            // Filter by type if present
            ->when($request->type, fn($q) => $q->where('ben_type', $request->type))
            // Filter by sex if present
            ->when($request->sexe, fn($q) => $q->where('ben_sexe', $request->sexe))
            // Filter by gender if present
            ->when($request->genre, fn($q) => $q->where('ben_genre', $request->genre))
            // Search by first or last name if search parameter is present
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('ben_prenom', 'like', "%$search%")
                      ->orWhere('ben_nom', 'like', "%$search%");
                });
            })
            ->get();

        return response()->json($beneficiaires);
    }

    // Stores a new beneficiary after validating the request data
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

        // If type is "AUTRE", ben_type_autre is required
        if ($validated['ben_type'] === Type::AUTRE->value && empty($validated['ben_type_autre'])) {
            $errors['ben_type_autre'] = 'Champ requis si type est "Autre"';
        }

        // If sex is "AUTRE", ben_sexe_autre is required
        if ($validated['ben_sexe'] === Sexe::AUTRE->value && empty($validated['ben_sexe_autre'])) {
            $errors['ben_sexe_autre'] = 'Champ requis si sexe est "Autre"';
        }

        // If gender is "AUTRE", ben_genre_autre is required
        if (
            isset($validated['ben_genre']) &&
            $validated['ben_genre'] === Genre::AUTRE->value &&
            empty($validated['ben_genre_autre'])
        ) {
            $errors['ben_genre_autre'] = 'Champ requis si genre est "Autre"';
        }

        // Calculate age from date of birth
        $age = Carbon::parse($validated['ben_date_naissance'])->age;

        // If type is "ENFANT", age must be between 5 and 17
        if ($validated['ben_type'] === Type::ENFANT->value && !($age >= 5 && $age <= 17)) {
            $errors['ben_date_naissance'] = 'Un enfant doit avoir entre 5 et 17 ans.';
        }

        // If type is "JEUNE", age must be between 18 and 30
        if ($validated['ben_type'] === Type::JEUNE->value && !($age >= 18 && $age <= 30)) {
            $errors['ben_date_naissance'] = 'Un jeune doit avoir entre 18 et 30 ans.';
        }

        // Return errors if any validation failed
        if (!empty($errors)) {
            return response()->json(['errors' => $errors], 422);
        }

        // Convert string values to Enum instances
        $validated['ben_type'] = Type::from($validated['ben_type']);
        $validated['ben_zone'] = Zone::from($validated['ben_zone']);
        $validated['ben_sexe'] = Sexe::from($validated['ben_sexe']);
        if (!empty($validated['ben_genre'])) {
            $validated['ben_genre'] = Genre::from($validated['ben_genre']);
        }

        // Create the beneficiary
        $beneficiaire = Beneficiaire::create($validated);

        return response()->json($beneficiaire, 201);
    }

    // Returns a single beneficiary by ID
    public function show(string $id)
    {
        $b = Beneficiaire::findOrFail($id);

        return response()->json($b);
    }

    // Updates an existing beneficiary after validating the request data
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

        // If type is "AUTRE", ben_type_autre is required
        if ($validated['ben_type'] === Type::AUTRE->value && empty($validated['ben_type_autre'])) {
            $errors['ben_type_autre'] = 'Champ requis si type est "Autre"';
        }

        // If sex is "AUTRE", ben_sexe_autre is required
        if ($validated['ben_sexe'] === Sexe::AUTRE->value && empty($validated['ben_sexe_autre'])) {
            $errors['ben_sexe_autre'] = 'Champ requis si sexe est "Autre"';
        }

        // If gender is "AUTRE", ben_genre_autre is required
        if (
            isset($validated['ben_genre']) &&
            $validated['ben_genre'] === Genre::AUTRE->value &&
            empty($validated['ben_genre_autre'])
        ) {
            $errors['ben_genre_autre'] = 'Champ requis si genre est "Autre"';
        }

        // Calculate age from date of birth
        $age = Carbon::parse($validated['ben_date_naissance'])->age;

        // If type is "ENFANT", age must be between 5 and 17
        if ($validated['ben_type'] === Type::ENFANT->value && !($age >= 5 && $age <= 17)) {
            $errors['ben_date_naissance'] = 'Un enfant doit avoir entre 5 et 17 ans.';
        }

        // If type is "JEUNE", age must be between 18 and 30
        if ($validated['ben_type'] === Type::JEUNE->value && !($age >= 18 && $age <= 30)) {
            $errors['ben_date_naissance'] = 'Un jeune doit avoir entre 18 et 30 ans.';
        }

        // Return errors if any validation failed
        if (!empty($errors)) {
            return response()->json(['errors' => $errors], 422);
        }

        // Convert string values to Enum instances
        $validated['ben_type'] = Type::from($validated['ben_type']);
        $validated['ben_zone'] = Zone::from($validated['ben_zone']);
        $validated['ben_sexe'] = Sexe::from($validated['ben_sexe']);
        if (!empty($validated['ben_genre'])) {
            $validated['ben_genre'] = Genre::from($validated['ben_genre']);
        }

        // Update the beneficiary
        $beneficiaire->update($validated);

        return response()->json($beneficiaire);
    }

    // Deletes a beneficiary by ID
    public function destroy(string $id)
    {
        $beneficiaire = Beneficiaire::findOrFail($id);
        $beneficiaire->delete();

        return response()->json(['message' => 'Bénéficiaire supprimé avec succès']);
    }

    // Checks if a beneficiary already exists with the same name, first name, birth date, and sex
    public function checkDuplicate(Request $request)
    {
        $validated = $request->validate([
            'ben_nom' => 'required|string|max:50',
            'ben_prenom' => 'required|string|max:50',
            'ben_date_naissance' => 'required|date',
            'ben_sexe' => ['required', new Enum(Sexe::class)],
        ]);

        // Search for a duplicate beneficiary
        $duplicate = Beneficiaire::where('ben_nom', $validated['ben_nom'])
            ->where('ben_prenom', $validated['ben_prenom'])
            ->where('ben_date_naissance', $validated['ben_date_naissance'])
            ->where('ben_sexe', $validated['ben_sexe'])
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