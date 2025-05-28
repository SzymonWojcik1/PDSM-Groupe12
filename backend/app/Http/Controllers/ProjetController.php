<?php

namespace App\Http\Controllers;

use App\Models\Projet;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Helpers\Logger;

class ProjetController extends Controller
{
    public function index()
    {
        return response()->json(Projet::with('partenaire')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'pro_nom' => 'required|string|max:255',
            'pro_dateDebut' => 'required|date',
            'pro_dateFin' => 'required|date',
            'pro_part_id' => 'required|exists:partenaires,part_id',
        ]);

        $dateDebut = Carbon::parse($validated['pro_dateDebut']);
        $dateFin = Carbon::parse($validated['pro_dateFin']);

        if ($dateDebut->gt($dateFin)) {
            return response()->json(['message' => 'La date de début ne peut pas être après la date de fin.'], 400);
        }

        if ($dateDebut->isPast() || $dateFin->isPast()) {
            return response()->json(['message' => 'Les dates ne peuvent pas être dans le passé.'], 400);
        }

        $exists = Projet::whereRaw('LOWER(pro_nom) = ?', [strtolower($validated['pro_nom'])])
            ->where('pro_dateDebut', $validated['pro_dateDebut'])
            ->where('pro_dateFin', $validated['pro_dateFin'])
            ->where('pro_part_id', $validated['pro_part_id'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Un projet identique existe déjà pour ce partenaire à ces dates.'], 409);
        }

        $projet = Projet::create($validated);

        Logger::log(
            'info',
            'Création projet',
            'Un nouveau projet a été créé.',
            ['id' => $projet->pro_id, 'nom' => $projet->pro_nom],
            auth()->id()
        );

        return response()->json($projet, 201);
    }

    public function show($id)
    {
        $projet = Projet::with('partenaire')->find($id);

        if (!$projet) {
            return response()->json(['message' => 'Projet non trouvé'], 404);
        }

        return response()->json($projet);
    }

    public function update(Request $request, $id)
    {
        $projet = Projet::find($id);

        if (!$projet) {
            return response()->json(['message' => 'Projet non trouvé'], 404);
        }

        $validated = $request->validate([
            'pro_nom' => 'required|string|max:255',
            'pro_dateDebut' => 'required|date',
            'pro_dateFin' => 'required|date',
            'pro_part_id' => 'required|exists:partenaires,part_id',
        ]);

        $now = Carbon::now();
        $ancienDebut = Carbon::parse($projet->pro_dateDebut);

        if ($now->gte($ancienDebut)) {
            return response()->json(['message' => 'Impossible de modifier un projet en cours ou terminé.'], 403);
        }

        $nouveauDebut = Carbon::parse($validated['pro_dateDebut']);
        $nouveauFin = Carbon::parse($validated['pro_dateFin']);

        if ($nouveauDebut->gt($nouveauFin)) {
            return response()->json(['message' => 'La date de début ne peut pas être après la date de fin.'], 400);
        }

        if ($nouveauDebut->isPast() || $nouveauFin->isPast()) {
            return response()->json(['message' => 'Les dates ne peuvent pas être dans le passé.'], 400);
        }

        $exists = Projet::whereRaw('LOWER(pro_nom) = ?', [strtolower($validated['pro_nom'])])
            ->where('pro_dateDebut', $validated['pro_dateDebut'])
            ->where('pro_dateFin', $validated['pro_dateFin'])
            ->where('pro_part_id', $validated['pro_part_id'])
            ->where('pro_id', '!=', $id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Un projet identique existe déjà pour ce partenaire à ces dates.'], 409);
        }

        $projet->update($validated);

        Logger::log(
            'info',
            'Mise à jour projet',
            'Un projet a été modifié.',
            ['id' => $projet->pro_id, 'nom' => $projet->pro_nom],
            auth()->id()
        );

        return response()->json($projet);
    }

    public function destroy($id)
    {
        $projet = Projet::find($id);

        if (!$projet) {
            return response()->json(['message' => 'Projet non trouvé'], 404);
        }

        $projet->delete();

        Logger::log(
            'info',
            'Suppression projet',
            'Un projet a été supprimé.',
            ['id' => $projet->pro_id, 'nom' => $projet->pro_nom],
            auth()->id()
        );

        return response()->json(['message' => 'Projet supprimé']);
    }
}
