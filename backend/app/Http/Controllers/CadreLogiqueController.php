<?php

namespace App\Http\Controllers;

use App\Models\CadreLogique;
use Illuminate\Http\Request;
use App\Helpers\Logger;

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

        $cadre = CadreLogique::create($validated);

        Logger::log(
            'info',
            'Création cadre logique',
            'Un nouveau cadre logique a été créé',
            ['cadre_id' => $cadre->cad_id, 'nom' => $cadre->cad_nom],
            auth()->id()
        );

        return response()->json($cadre, 201);
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

        $cadre->update([
            'cad_nom' => $validated['cad_nom'] ?? $cadre->cad_nom,
            'cad_dateDebut' => $validated['cad_dateDebut'] ?? $cadre->cad_dateDebut,
            'cad_dateFin' => $validated['cad_dateFin'] ?? $cadre->cad_dateFin,
        ]);

        Logger::log(
            'info',
            'Mise à jour cadre logique',
            'Cadre logique modifié',
            ['cadre_id' => $cadre->cad_id],
            auth()->id()
        );

        return response()->json($cadre);
    }

    public function destroy($id)
    {
        $cadre = CadreLogique::findOrFail($id);
        $cadre->delete();

        Logger::log(
            'info',
            'Suppression cadre logique',
            'Un cadre logique a été supprimé',
            ['cadre_id' => $id, 'nom' => $cadre->cad_nom],
            auth()->id()
        );

        return response()->json(['message' => 'Cadre logique supprimé']);
    }

    public function structure($id)
    {
        $cadre = CadreLogique::with([
            'objectifsGeneraux.outcomes.outputs.indicateurs.activites'
        ])->findOrFail($id);

        // Calcul valeurReelle
        foreach ($cadre->objectifsGeneraux as $objectif) {
            foreach ($objectif->outcomes as $outcome) {
                foreach ($outcome->outputs as $output) {
                    foreach ($output->indicateurs as $indicateur) {
                        $ids = $indicateur->activites->pluck('act_id');
                        $count = \DB::table('activite_beneficiaire')
                            ->whereIn('acb_act_id', $ids)
                            ->distinct('acb_ben_id')
                            ->count('acb_ben_id');

                        $indicateur->valeurReelle = $count;
                    }
                }
            }
        }

        return response()->json($cadre->objectifsGeneraux);
    }
}
