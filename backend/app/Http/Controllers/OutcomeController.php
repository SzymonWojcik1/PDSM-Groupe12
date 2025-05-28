<?php

namespace App\Http\Controllers;

use App\Models\Outcome;
use Illuminate\Http\Request;
use App\Helpers\Logger;

class OutcomeController extends Controller
{
    public function index(Request $request)
    {
        $query = Outcome::query();
        if ($request->has('obj_id')) {
            $query->where('obj_id', $request->input('obj_id'));
        }
        return $query->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'out_nom' => 'required|string',
            'out_code' => 'required|string|max:20',
            'obj_id'   => 'required|exists:objectif_general,obj_id',
        ]);

        $outcome = Outcome::create($validated);

        Logger::log(
            'info',
            'Création outcome',
            'Un nouvel outcome a été créé.',
            ['id' => $outcome->out_id, 'nom' => $outcome->out_nom, 'code' => $outcome->out_code],
            auth()->id()
        );

        return response()->json($outcome, 201);
    }

    public function show($id)
    {
        return Outcome::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $outcome = Outcome::findOrFail($id);

        $validated = $request->validate([
            'out_nom'  => 'sometimes|string',
            'out_code' => 'sometimes|string|max:20',
            'obj_id'   => 'sometimes|exists:objectif_general,obj_id',
        ]);

        $outcome->update($validated);

        Logger::log(
            'info',
            'Mise à jour outcome',
            'Un outcome a été mis à jour.',
            ['id' => $outcome->out_id, 'nom' => $outcome->out_nom],
            auth()->id()
        );

        return response()->json($outcome);
    }

    public function destroy($id)
    {
        $outcome = Outcome::findOrFail($id);
        $outcome->delete();

        Logger::log(
            'info',
            'Suppression outcome',
            'Un outcome a été supprimé.',
            ['id' => $outcome->out_id, 'nom' => $outcome->out_nom],
            auth()->id()
        );

        return response()->json(['message' => 'Outcome supprimé']);
    }
}
