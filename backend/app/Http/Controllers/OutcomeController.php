<?php

namespace App\Http\Controllers;

use App\Models\Outcome;
use Illuminate\Http\Request;
use App\Helpers\Logger;

class OutcomeController extends Controller
{
    /**
     * Display a listing of the outcomes.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $query = Outcome::query();

        // Filter by 'obj_id' if provided
        if ($request->has('obj_id')) {
            $query->where('obj_id', $request->input('obj_id'));
        }

        return $query->get();
    }

    /**
     * Store a newly created outcome in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // Validate input data
        $validated = $request->validate([
            'out_nom' => 'required|string',
            'out_code' => 'required|string|max:20',
            'obj_id'   => 'required|exists:objectif_general,obj_id',
        ]);

        // Create outcome
        $outcome = Outcome::create($validated);

        // Log creation
        Logger::log(
            'info',
            'Création outcome',
            'Un nouvel outcome a été créé.',
            ['id' => $outcome->out_id, 'nom' => $outcome->out_nom, 'code' => $outcome->out_code],
            auth()->id()
        );

        return response()->json($outcome, 201);
    }

    /**
     * Display the specified outcome.
     * 
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return Outcome::findOrFail($id);
    }

    // Update an existing outcome
    public function update(Request $request, $id)
    {
        $outcome = Outcome::findOrFail($id);

        // Validate fields (all optional)
        $validated = $request->validate([
            'out_nom'  => 'sometimes|string',
            'out_code' => 'sometimes|string|max:20',
            'obj_id'   => 'sometimes|exists:objectif_general,obj_id',
        ]);

        // Update the outcome with validated data
        $outcome->update($validated);

        // Log update
        Logger::log(
            'info',
            'Mise à jour outcome',
            'Un outcome a été mis à jour.',
            ['id' => $outcome->out_id, 'nom' => $outcome->out_nom],
            auth()->id()
        );

        return response()->json($outcome);
    }

    // Delete an outcome
    public function destroy($id)
    {
        $outcome = Outcome::findOrFail($id);
        $outcome->delete();

        // Log deletion
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
