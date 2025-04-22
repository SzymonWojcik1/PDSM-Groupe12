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

        $partenaire = Partenaire::create($validated);

        return response()->json($partenaire, 201);
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

        $partenaire->update($validated);

        return response()->json($partenaire);
    }

    public function show($id)
    {
        $partenaire = Partenaire::find($id);

        if (!$partenaire) {
            return response()->json(['message' => 'Partenaire non trouvé'], 404);
        }

        return response()->json($partenaire);
    }

}
