<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\IndicateurActivite;

class IndicateurActiviteController extends Controller
{
    public function index()
    {
        return IndicateurActivite::with(['activite', 'indicateur'])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'act_id' => 'required|exists:activites,act_id',
            'ind_id' => 'required|exists:indicateur,ind_id',
        ]);

        return IndicateurActivite::create($validated);
    }

    public function show($id)
    {
        return IndicateurActivite::with(['activite', 'indicateur'])->findOrFail($id);
    }

    public function destroy($id)
    {
        $item = IndicateurActivite::findOrFail($id);
        $item->delete();

        return response()->json(['message' => 'Lien supprimé avec succès']);
    }
}
