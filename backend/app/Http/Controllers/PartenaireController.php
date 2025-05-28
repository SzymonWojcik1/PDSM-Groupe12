<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Partenaire;
use App\Helpers\Logger;

class PartenaireController extends Controller
{
    public function index()
    {
        $partenaires = Partenaire::all();
        return response()->json($partenaires);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'part_nom' => 'required|string|max:255',
            'part_pays' => 'required|string|max:255',
            'part_region' => 'required|string|max:255',
        ]);

        $exists = Partenaire::whereRaw('LOWER(part_nom) = ?', [strtolower($validated['part_nom'])])
            ->whereRaw('LOWER(part_pays) = ?', [strtolower($validated['part_pays'])])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Un partenaire avec ce nom et ce pays existe déjà.'], 409);
        }

        $partenaire = Partenaire::create($validated);

        Logger::log(
            'info',
            'Création partenaire',
            'Un nouveau partenaire a été créé.',
            ['id' => $partenaire->part_id, 'nom' => $partenaire->part_nom],
            auth()->id()
        );

        return response()->json($partenaire, 201);
    }

    public function show($id)
    {
        $partenaire = Partenaire::find($id);

        if (!$partenaire) {
            return response()->json(['message' => 'Partenaire non trouvé'], 404);
        }

        return response()->json($partenaire);
    }

    public function update(Request $request, $id)
    {
        $partenaire = Partenaire::find($id);

        if (!$partenaire) {
            return response()->json(['message' => 'Partenaire non trouvé'], 404);
        }

        $validated = $request->validate([
            'part_nom' => 'required|string|max:255',
            'part_pays' => 'required|string|max:255',
            'part_region' => 'required|string|max:255',
        ]);

        $exists = Partenaire::whereRaw('LOWER(part_nom) = ?', [strtolower($validated['part_nom'])])
            ->whereRaw('LOWER(part_pays) = ?', [strtolower($validated['part_pays'])])
            ->where('part_id', '!=', $id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Un partenaire avec ce nom et ce pays existe déjà.'], 409);
        }

        $partenaire->update($validated);

        Logger::log(
            'info',
            'Mise à jour partenaire',
            'Un partenaire a été mis à jour.',
            ['id' => $partenaire->part_id, 'nom' => $partenaire->part_nom],
            auth()->id()
        );

        return response()->json($partenaire);
    }

    public function destroy($id)
    {
        $partenaire = Partenaire::find($id);

        if (!$partenaire) {
            return response()->json(['message' => 'Partenaire non trouvé'], 404);
        }

        $partenaire->delete();

        Logger::log(
            'info',
            'Suppression partenaire',
            'Un partenaire a été supprimé.',
            ['id' => $partenaire->part_id, 'nom' => $partenaire->part_nom],
            auth()->id()
        );

        return response()->json(['message' => 'Partenaire supprimé']);
    }

    public function users($id)
    {
        $partenaire = Partenaire::with('users')->find($id);

        if (!$partenaire) {
            return response()->json(['message' => 'Partenaire non trouvé'], 404);
        }

        return response()->json([
            'partenaire' => $partenaire->part_nom,
            'users' => $partenaire->users,
        ]);
    }
}
