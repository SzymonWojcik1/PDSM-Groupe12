<?php

namespace App\Http\Controllers;

use App\Models\Indicateur;
use Illuminate\Http\Request;
use App\Helpers\Logger;

class IndicateurController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $query = Indicateur::query();
        if ($request->has('opu_id')) {
            $query->where('opu_id', $request->input('opu_id'));
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
            'ind_code' => 'sometimes|string|max:20',
            'ind_nom' => 'required|string',
            'ind_valeurCible' => 'required|integer',
            'out_id' => 'nullable|exists:outcome,out_id',
            'opu_id' => 'nullable|exists:output,opu_id',
        ]);

        $indicateur = Indicateur::create($validated);

        Logger::log(
            'info',
            'Création indicateur',
            'Un nouvel indicateur a été créé.',
            ['id' => $indicateur->ind_id, 'nom' => $indicateur->ind_nom],
            auth()->id()
        );

        return response()->json($indicateur, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return Indicateur::findOrFail($id);
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
        $ind = Indicateur::findOrFail($id);

        $validated = $request->validate([
            'ind_code' => 'required|string|max:20',
            'ind_nom' => 'sometimes|string',
            'ind_valeurCible' => 'sometimes|integer',
            'out_id' => 'nullable|exists:outcome,out_id',
            'opu_id' => 'nullable|exists:output,opu_id',
        ]);

        $ind->update($validated);

        Logger::log(
            'info',
            'Mise à jour indicateur',
            'Un indicateur a été modifié.',
            ['id' => $ind->ind_id, 'nom' => $ind->ind_nom],
            auth()->id()
        );

        return response()->json($ind);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $ind = Indicateur::findOrFail($id);
        $ind->delete();

        Logger::log(
            'info',
            'Suppression indicateur',
            'Un indicateur a été supprimé.',
            ['id' => $ind->ind_id, 'nom' => $ind->ind_nom],
            auth()->id()
        );

        return response()->json(['message' => 'Indicateur supprimé']);
    }
}
