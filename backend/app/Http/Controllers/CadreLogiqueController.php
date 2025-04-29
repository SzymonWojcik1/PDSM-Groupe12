<?php

namespace App\Http\Controllers;

use App\Models\CadreLogique;
use Illuminate\Http\Request;

class CadreLogiqueController extends Controller
{
    public function index()
    {
        return CadreLogique::with([
            'objectifsGeneraux.outcomes.indicateurs',
            'objectifsGeneraux.outcomes.outputs.indicateurs'
        ])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cad_nom' => 'required|string|max:255',
            'cad_dateDebut' => 'required|date',
            'cad_dateFin' => 'required|date|after_or_equal:cad_dateDebut',
        ]);

        $exists = CadreLogique::where(function ($query) use ($validated) {
            $query->whereBetween('cad_dateDebut', [$validated['cad_dateDebut'], $validated['cad_dateFin']])
                ->orWhereBetween('cad_dateFin', [$validated['cad_dateDebut'], $validated['cad_dateFin']])
                ->orWhere(function ($query) use ($validated) {
                    $query->where('cad_dateDebut', '<=', $validated['cad_dateDebut'])
                            ->where('cad_dateFin', '>=', $validated['cad_dateFin']);
                });
        })->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Un cadre logique existe déjà sur cette période.'
            ], 409);
        }

        return response()->json(CadreLogique::create($validated), 201);
    }

    public function show($id)
    {
        return CadreLogique::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $cadre = CadreLogique::findOrFail($id);

        $validated = $request->validate([
            'cad_nom' => 'sometimes|string|max:255',
            'cad_dateDebut' => 'sometimes|date',
            'cad_dateFin' => 'sometimes|date|after_or_equal:cad_dateDebut',
        ]);

        $debut = $validated['cad_dateDebut'] ?? $cadre->cad_dateDebut;
        $fin = $validated['cad_dateFin'] ?? $cadre->cad_dateFin;

        $exists = CadreLogique::where('cad_id', '!=', $id)
            ->where(function ($query) use ($debut, $fin) {
                $query->whereBetween('cad_dateDebut', [$debut, $fin])
                    ->orWhereBetween('cad_dateFin', [$debut, $fin])
                    ->orWhere(function ($query) use ($debut, $fin) {
                        $query->where('cad_dateDebut', '<=', $debut)
                                ->where('cad_dateFin', '>=', $fin);
                    });
            })->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Un autre cadre logique existe déjà sur cette période.'
            ], 409);
        }

        $cadre->update($validated);
        return response()->json($cadre);
    }

    public function destroy($id)
    {
        $cadre = CadreLogique::findOrFail($id);
        $cadre->delete();

        return response()->json(['message' => 'Cadre logique supprimé']);
    }
}