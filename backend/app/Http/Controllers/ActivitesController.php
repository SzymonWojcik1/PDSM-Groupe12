<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Activites;
use Carbon\Carbon;

class ActivitesController extends Controller
{
    public function index()
    {
        return response()->json(Activites::with(['partenaire', 'projet'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'act_nom' => 'required|string|max:255',
            'act_dateDebut' => 'required|date',
            'act_dateFin' => 'required|date|after_or_equal:act_dateDebut',
            'act_part_id' => 'required|exists:partenaires,part_id',
            'act_pro_id' => 'required|exists:projet,pro_id',
        ]);

        $exists = Activites::whereRaw('LOWER(act_nom) = ?', [strtolower($validated['act_nom'])])
            ->where('act_dateDebut', $validated['act_dateDebut'])
            ->where('act_dateFin', $validated['act_dateFin'])
            ->where('act_pro_id', $validated['act_pro_id'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Une activité identique existe déjà pour ce projet à ces dates.'], 409);
        }

        $now = Carbon::now();
        $debut = Carbon::parse($validated['act_dateDebut']);
        $fin = Carbon::parse($validated['act_dateFin']);

        if ($debut->lt($now) || $fin->lt($now)) {
            return response()->json(['message' => 'Les dates ne peuvent pas être dans le passé.'], 400);
        }

        if ($debut->gt($fin)) {
            return response()->json(['message' => 'La date de début ne peut pas être après la date de fin.'], 400);
        }

        $activites = Activites::create($validated);
        return response()->json($activites, 201);
    }

    public function show($id)
    {
        $activites = Activites::with(['partenaire', 'projet'])->find($id);

        if (!$activites) {
            return response()->json(['message' => 'Activité non trouvée'], 404);
        }

        return response()->json($activites);
    }

    public function update(Request $request, $id)
    {
        $activites = Activites::find($id);

        if (!$activites) {
            return response()->json(['message' => 'Activité non trouvée'], 404);
        }

        $validated = $request->validate([
            'act_nom' => 'required|string|max:255',
            'act_dateDebut' => 'required|date',
            'act_dateFin' => 'required|date|after_or_equal:act_dateDebut',
            'act_part_id' => 'required|exists:partenaires,part_id',
            'act_pro_id' => 'required|exists:projet,pro_id',
        ]);


        $exists = Activites::whereRaw('LOWER(act_nom) = ?', [strtolower($validated['act_nom'])])
            ->where('act_dateDebut', $validated['act_dateDebut'])
            ->where('act_dateFin', $validated['act_dateFin'])
            ->where('act_pro_id', $validated['act_pro_id'])
            ->where('act_id', '!=', $id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Une activité identique existe déjà pour ce projet à ces dates.'], 409);
        }

        $now = Carbon::now();
        $ancienDebut = Carbon::parse($activites->act_dateDebut);

        if ($now->gte($ancienDebut)) {
            return response()->json(['message' => 'Impossible de modifier une activité déjà commencée ou terminée.'], 403);
        }

        $nouveauDebut = Carbon::parse($validated['act_dateDebut']);
        $nouveauFin = Carbon::parse($validated['act_dateFin']);

        if ($nouveauDebut->lt($now) || $nouveauFin->lt($now)) {
            return response()->json(['message' => 'Les nouvelles dates ne peuvent pas être dans le passé.'], 400);
        }

        if ($nouveauDebut->gt($nouveauFin)) {
            return response()->json(['message' => 'La date de début ne peut pas être après la date de fin.'], 400);
        }

        $activites->update($validated);
        return response()->json($activites);
    }

    public function destroy($id)
    {
        $activites = Activites::find($id);

        if (!$activites) {
            return response()->json(['message' => 'Activité non trouvée'], 404);
        }

        $activites->delete();
        return response()->json(['message' => 'Activité supprimée']);
    }
}
