<?php

namespace App\Http\Controllers;

use App\Models\ObjectifGeneral;
use Illuminate\Http\Request;
use App\Helpers\Logger;

class ObjectifGeneralController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $query = ObjectifGeneral::query();
        if ($request->has('cad_id')) {
            $query->where('cad_id', $request->input('cad_id'));
        }
        return $query->get();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'obj_nom' => 'required|string',
            'cad_id' => 'required|exists:cadre_logique,cad_id',
        ]);

        $objectif = ObjectifGeneral::create($validated);

        Logger::log(
            'info',
            'Création objectif général',
            'Un nouvel objectif général a été créé.',
            ['id' => $objectif->obj_id, 'nom' => $objectif->obj_nom],
            auth()->id()
        );

        return response()->json($objectif, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return ObjectifGeneral::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $objectif = ObjectifGeneral::findOrFail($id);

        $validated = $request->validate([
            'obj_nom' => 'sometimes|string',
            'cad_id' => 'sometimes|exists:cadre_logique,cad_id',
        ]);

        $objectif->update($validated);

        Logger::log(
            'info',
            'Mise à jour objectif général',
            'Un objectif général a été mis à jour.',
            ['id' => $objectif->obj_id, 'nom' => $objectif->obj_nom],
            auth()->id()
        );

        return response()->json($objectif);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $objectif = ObjectifGeneral::findOrFail($id);
        $objectif->delete();

        Logger::log(
            'info',
            'Suppression objectif général',
            'Un objectif général a été supprimé.',
            ['id' => $objectif->obj_id, 'nom' => $objectif->obj_nom],
            auth()->id()
        );

        return response()->json(['message' => 'Objectif général supprimé']);
    }
}
