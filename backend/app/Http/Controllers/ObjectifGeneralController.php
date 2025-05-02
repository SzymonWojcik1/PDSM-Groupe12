<?php

namespace App\Http\Controllers;

use App\Models\ObjectifGeneral;
use Illuminate\Http\Request;

class ObjectifGeneralController extends Controller
{
    public function index(Request $request)
    {
        $query = ObjectifGeneral::query();
        if ($request->has('cad_id')) {
            $query->where('cad_id', $request->input('cad_id'));
        }
        return $query->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'obj_nom' => 'required|string',
            'cad_id' => 'required|exists:cadre_logique,cad_id',
        ]);

        return response()->json(ObjectifGeneral::create($validated), 201);
    }

    public function show($id)
    {
        return ObjectifGeneral::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $objectif = ObjectifGeneral::findOrFail($id);

        $validated = $request->validate([
            'obj_nom' => 'sometimes|string',
            'cad_id' => 'sometimes|exists:cadre_logique,cad_id',
        ]);

        $objectif->update($validated);

        return response()->json($objectif);
    }

    public function destroy($id)
    {
        ObjectifGeneral::findOrFail($id)->delete();

        return response()->json(['message' => 'Objectif général supprimé']);
    }
}