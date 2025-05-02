<?php

namespace App\Http\Controllers;

use App\Models\Indicateur;
use Illuminate\Http\Request;

class IndicateurController extends Controller
{
    public function index()
    {
        return Indicateur::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ind_code' => 'required|string|max:20',
            'ind_nom' => 'required|string',
            'ind_valeurCible' => 'required|integer',
            'out_id' => 'nullable|exists:outcome,out_id',
            'opu_id' => 'nullable|exists:output,opu_id',
        ]);

        return response()->json(Indicateur::create($validated), 201);
    }

    public function show($id)
    {
        return Indicateur::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $ind = Indicateur::findOrFail($id);

        $validated = $request->validate([
            'ind_code' => 'required|string|max:20',
            'ind_nom' => 'sometimes|string',
            'ind_valeurCible' => 'sometimes|integer',
            'out_id' => 'nullable|exists:outcome,out_id',
            'opu_id' => 'nullable|exists:output,opu_id',
        ]);

        $ind->update($validated);

        return response()->json($ind);
    }

    public function destroy($id)
    {
        Indicateur::findOrFail($id)->delete();

        return response()->json(['message' => 'Indicateur supprimé']);
    }
}