<?php

namespace App\Http\Controllers;

use App\Models\Projet;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ProjetController extends Controller
{
    // Afficher tous les projets
    public function index()
    {
        return response()->json(Projet::with('partenaire')->get());
    }

    // Créer un nouveau projet
    public function store(Request $request)
    {
        $validated = $request->validate([
            'pro_nom' => 'required|string|max:255',
            'pro_dateDebut' => 'required|date',
            'pro_dateFin' => 'required|date|after_or_equal:pro_dateDebut',
            'pro_part_id' => 'required|exists:partenaires,part_id',
        ]);

        $dateDebut = Carbon::parse($validated['pro_dateDebut']);
        $dateFin = Carbon::parse($validated['pro_dateFin']);

        if ($dateDebut->isPast() || $dateFin->isPast()) {
            return response()->json(['message' => 'Les dates ne peuvent pas être dans le passé'], 400);
        }

        if ($dateDebut->gt($dateFin)) {
            return response()->json(['message' => 'La date de début ne peut pas être après la date de fin.'], 400);
        }

        $projet = Projet::create($validated);
        return response()->json($projet, 201);
    }

    // Afficher un projet spécifique
    public function show($id)
    {
        $projet = Projet::with('partenaire')->find($id);

        if (!$projet) {
            return response()->json(['message' => 'Projet non trouvé'], 404);
        }

        return response()->json($projet);
    }

    // Mettre à jour un projet
    public function update(Request $request, $id)
    {
        $projet = Projet::find($id);

        if (!$projet) {
            return response()->json(['message' => 'Projet non trouvé'], 404);
        }

        $validated = $request->validate([
            'pro_nom' => 'required|string|max:255',
            'pro_dateDebut' => 'required|date',
            'pro_dateFin' => 'required|date|after_or_equal:pro_dateDebut',
            'pro_part_id' => 'required|exists:partenaires,part_id',
        ]);

        $now = Carbon::now();
        $ancienDebut = Carbon::parse($projet->pro_dateDebut);

        // Empêcher modification si projet a déjà commencé
        if ($now->gte($ancienDebut)) {
            return response()->json(['message' => 'Impossible de modifier les dates d’un projet en cours ou terminé'], 403);
        }

        $nouveauDebut = Carbon::parse($validated['pro_dateDebut']);
        $nouveauFin = Carbon::parse($validated['pro_dateFin']);

        // Empêcher de fixer des dates dans le passé
        if ($nouveauDebut->isPast() || $nouveauFin->isPast()) {
            return response()->json(['message' => 'Impossible de définir une date passée pour un projet futur'], 400);
        }

        if ($nouveauDebut->gt($nouveauFin)) {
            return response()->json(['message' => 'La date de début ne peut pas être après la date de fin.'], 400);
        }

        $projet->update($validated);
        return response()->json($projet);
    }

    // Supprimer un projet
    public function destroy($id)
    {
        $projet = Projet::find($id);

        if (!$projet) {
            return response()->json(['message' => 'Projet non trouvé'], 404);
        }

        $projet->delete();
        return response()->json(['message' => 'Projet supprimé']);
    }
}