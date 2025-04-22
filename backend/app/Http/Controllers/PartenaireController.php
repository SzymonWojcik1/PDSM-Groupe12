<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Partenaire;

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
        return response()->json($partenaire);
    }

    public function destroy($id)
    {
        $partenaire = Partenaire::find($id);

        if (!$partenaire) {
            return response()->json(['message' => 'Partenaire non trouvé'], 404);
        }

        $partenaire->delete();
        return response()->json(['message' => 'Partenaire supprimé']);
    }
}
