<?php

namespace App\Http\Controllers;

use App\Models\CadreLogique;
use Illuminate\Http\Request;

class CadreLogiqueController extends Controller
{
    public function index()
    {
        return CadreLogique::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cad_nom' => 'required|string|max:255',
            'cad_dateDebut' => 'required|date',
            'cad_dateFin' => 'required|date',
        ]);

        return CadreLogique::create($validated);
    }

    public function show($id)
    {
        return CadreLogique::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $cadre = CadreLogique::findOrFail($id);
        $cadre->update($request->all());

        return $cadre;
    }

    public function destroy($id)
    {
        $cadre = CadreLogique::findOrFail($id);
        $cadre->delete();

        return response()->json(['message' => 'Cadre logique supprimé']);
    }
}