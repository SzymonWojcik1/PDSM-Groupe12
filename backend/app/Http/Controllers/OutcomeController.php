<?php

namespace App\Http\Controllers;

use App\Models\Outcome;
use Illuminate\Http\Request;

class OutcomeController extends Controller
{
    public function index()
    {
        return Outcome::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'out_nom' => 'required|string',
            'obj_id' => 'required|exists:objectif_general,obj_id',
        ]);

        return response()->json(Outcome::create($validated), 201);
    }

    public function show($id)
    {
        return Outcome::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $outcome = Outcome::findOrFail($id);

        $validated = $request->validate([
            'out_nom' => 'sometimes|string',
            'obj_id' => 'sometimes|exists:objectif_general,obj_id',
        ]);

        $outcome->update($validated);

        return response()->json($outcome);
    }

    public function destroy($id)
    {
        Outcome::findOrFail($id)->delete();

        return response()->json(['message' => 'Outcome supprimé']);
    }
}