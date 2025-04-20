<?php

namespace App\Http\Controllers;

use App\Models\Beneficiaire;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;
use App\Enums\Type;
use App\Enums\Zone;
use App\Enums\Sexe;
use App\Enums\Genre;

class BeneficiaireController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $beneficiaires = Beneficiaire::query()
            ->when($request->region, fn($q) => $q->where('region', $request->region))
            ->when($request->pays, fn($q) => $q->where('pays', $request->pays))
            ->when($request->zone, fn($q) => $q->where('zone', $request->zone))
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->when($request->sexe, fn($q) => $q->where('sexe', $request->sexe))
            ->when($request->genre, fn($q) => $q->where('genre', $request->genre))
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('prenom', 'like', "%$search%")
                    ->orWhere('nom', 'like', "%$search%");
                });
            })
            ->get();
        
        $beneficiaires = $beneficiaires->map(function ($b) {
            return [
                'id' => $b->id,
                'prenom' => $b->prenom,
                'nom' => $b->nom,
                'date_naissance' => $b->date_naissance,
                'region' => $b->region,
                'pays' => $b->pays,
                'type' => $b->type->value,
                'type_label' => $b->type->label(),
                'type_autre' => $b->type_autre,
                'zone' => $b->zone->value,
                'zone_label' => $b->zone->label(),
                'sexe' => $b->sexe->value,
                'sexe_label' => $b->sexe->label(),
                'sexe_autre' => $b->sexe_autre,
                'genre' => optional($b->genre)->value,
                'genre_label' => optional($b->genre)?->label(),
                'genre_autre' => $b->genre_autre,
                'ethnicite' => $b->ethnicite,
                'created_at' => $b->created_at,
                'updated_at' => $b->updated_at,
            ];
        });

        // ✅ Ce return est maintenant à la bonne place
        return response()->json($beneficiaires);
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'prenom' => 'required|string|max:50',
            'nom' => 'required|string|max:50',
            'date_naissance' => 'required|date',
            'region' => 'required|string',
            'pays' => 'required|string',
            'type' => ['required', new Enum(Type::class)],
            'type_autre' => 'nullable|string',
            'zone' => ['required', new Enum(Zone::class)],
            'sexe' => ['required', new Enum(Sexe::class)],
            'sexe_autre' => 'nullable|string',
            'genre' => ['nullable', new Enum(Genre::class)],
            'genre_autre' => 'nullable|string',
            'ethnicite' => 'required|string',
        ]);

        // Caster les enums pour que les comparaisons marchent
        $validated['type'] = Type::from($validated['type']);
        $validated['zone'] = Zone::from($validated['zone']);
        $validated['sexe'] = Sexe::from($validated['sexe']);
        if (!empty($validated['genre'])) {
            $validated['genre'] = Genre::from($validated['genre']);
        }

        // Vérifications des champs "autre"
        $erreurs = [];

        if ($validated['type'] === Type::AUTRE && empty($validated['type_autre'])) {
            $erreurs['type_autre'] = 'Le champ "type_autre" est requis si "type" est "Autre".';
        }

        if ($validated['sexe'] === Sexe::AUTRE && empty($validated['sexe_autre'])) {
            $erreurs['sexe_autre'] = 'Le champ "sexe_autre" est requis si "sexe" est "Autre".';
        }

        if (
            isset($validated['genre']) &&
            $validated['genre'] === Genre::AUTRE &&
            empty($validated['genre_autre'])
        ) {
            $erreurs['genre_autre'] = 'Le champ "genre_autre" est requis si "genre" est "Autre".';
        }

        if (!empty($erreurs)) {
            return response()->json(['errors' => $erreurs], 422);
        }

        $beneficiaire = Beneficiaire::create($validated);

        return response()->json($beneficiaire, 201);
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $beneficiaire = Beneficiaire::findOrFail($id);

        return response()->json([
            'id' => $beneficiaire->id,
            'prenom' => $beneficiaire->prenom,
            'nom' => $beneficiaire->nom,
            'date_naissance' => $beneficiaire->date_naissance,
            'region' => $beneficiaire->region,
            'pays' => $beneficiaire->pays,
            'type' => $beneficiaire->type->value,
            'type_label' => $beneficiaire->type->label(),
            'type_autre' => $beneficiaire->type_autre,
            'zone' => $beneficiaire->zone->value,
            'zone_label' => $beneficiaire->zone->label(),
            'sexe' => $beneficiaire->sexe->value,
            'sexe_label' => $beneficiaire->sexe->label(),
            'sexe_autre' => $beneficiaire->sexe_autre,
            'genre' => optional($beneficiaire->genre)->value,
            'genre_label' => optional($beneficiaire->genre)?->label(),
            'genre_autre' => $beneficiaire->genre_autre,
            'ethnicite' => $beneficiaire->ethnicite,
            'created_at' => $beneficiaire->created_at,
            'updated_at' => $beneficiaire->updated_at,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $beneficiaire = Beneficiaire::findOrFail($id);

        $validated = $request->validate([
            'prenom' => 'required|string|max:50',
            'nom' => 'required|string|max:50',
            'date_naissance' => 'required|date',
            'region' => 'required|string',
            'pays' => 'required|string',
            'type' => ['required', new Enum(Type::class)],
            'type_autre' => 'nullable|string',
            'zone' => ['required', new Enum(Zone::class)],
            'sexe' => ['required', new Enum(Sexe::class)],
            'sexe_autre' => 'nullable|string',
            'genre' => ['nullable', new Enum(Genre::class)],
            'genre_autre' => 'nullable|string',
            'ethnicite' => 'required|string',
        ]);

        // Cast manuel des enums après validation
        $validated['type'] = Type::from($validated['type']);
        $validated['zone'] = Zone::from($validated['zone']);
        $validated['sexe'] = Sexe::from($validated['sexe']);
        if (!empty($validated['genre'])) {
            $validated['genre'] = Genre::from($validated['genre']);
        }

        // Vérifications des champs "autre"
        $erreurs = [];

        if ($validated['type'] === Type::AUTRE && empty($validated['type_autre'])) {
            $erreurs['type_autre'] = 'Le champ "type_autre" est requis si "type" est "Autre".';
        }

        if ($validated['sexe'] === Sexe::AUTRE && empty($validated['sexe_autre'])) {
            $erreurs['sexe_autre'] = 'Le champ "sexe_autre" est requis si "sexe" est "Autre".';
        }

        if (
            isset($validated['genre']) &&
            $validated['genre'] === Genre::AUTRE &&
            empty($validated['genre_autre'])
        ) {
            $erreurs['genre_autre'] = 'Le champ "genre_autre" est requis si "genre" est "Autre".';
        }

        if (!empty($erreurs)) {
            return response()->json(['errors' => $erreurs], 422);
        }

        $beneficiaire->update($validated);

        return response()->json($beneficiaire, 200);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $beneficiaire = Beneficiaire::findOrFail($id);

        $beneficiaire->delete();

        return response()->json([
            'message' => 'Bénéficiaire supprimé avec succès.'
        ], 200);
    }
}
