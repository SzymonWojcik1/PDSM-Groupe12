<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Activites;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\StreamedResponse;
use App\Models\Log;
use App\Helpers\Logger;

class ActivitesController extends Controller
{
    // Return all activities with related partner and project data
    public function index()
    {
        return response()->json(Activites::with(['partenaire', 'projet'])->get());
    }

    // Store a new activity
    public function store(Request $request)
    {
        // Validate input fields
        $validated = $request->validate([
            'act_nom' => 'required|string|max:255',
            'act_dateDebut' => 'required|date',
            'act_dateFin' => 'required|date|after_or_equal:act_dateDebut',
            'act_part_id' => 'required|exists:partenaires,part_id',
            'act_pro_id' => 'required|exists:projet,pro_id',
        ]);

        // Check if the same activity already exists for the same project and dates
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

        // Prevent creating activity with past dates
        if ($debut->lt($now) || $fin->lt($now)) {
            return response()->json(['message' => 'Les dates ne peuvent pas être dans le passé.'], 400);
        }

        // Prevent start date being after end date
        if ($debut->gt($fin)) {
            return response()->json(['message' => 'La date de début ne peut pas être après la date de fin.'], 400);
        }

        // Create the activity
        $activites = Activites::create($validated);

        // Log activity creation
        Logger::log(
            'info',
            'Création activité',
            'Une nouvelle activité a été créée',
            ['id' => $activites->act_id, "nom" => $activites->act_nom, "debut" => $activites->act_dateDebut],
            auth()->id()
        );

        return response()->json($activites, 201);
    }

    // Show a specific activity
    public function show($id)
    {
        // Retrieve activity with its relations
        $activites = Activites::with(['partenaire', 'projet'])->find($id);

        if (!$activites) {
            return response()->json(['message' => 'Activité non trouvée'], 404);
        }

        return response()->json($activites);
    }

    // Update an existing activity
    public function update(Request $request, $id)
    {
        $activites = Activites::find($id);

        if (!$activites) {
            return response()->json(['message' => 'Activité non trouvée'], 404);
        }

        // Validate new data
        $validated = $request->validate([
            'act_nom' => 'required|string|max:255',
            'act_dateDebut' => 'required|date',
            'act_dateFin' => 'required|date|after_or_equal:act_dateDebut',
            'act_part_id' => 'required|exists:partenaires,part_id',
            'act_pro_id' => 'required|exists:projet,pro_id',
        ]);

        // Check for duplicate activity (excluding the current one)
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

        // Prevent modification if the activity has already started
        if ($now->gte($ancienDebut)) {
            return response()->json(['message' => 'Impossible de modifier une activité déjà commencée ou terminée.'], 403);
        }

        $nouveauDebut = Carbon::parse($validated['act_dateDebut']);
        $nouveauFin = Carbon::parse($validated['act_dateFin']);

        // Prevent setting new dates in the past
        if ($nouveauDebut->lt($now) || $nouveauFin->lt($now)) {
            return response()->json(['message' => 'Les nouvelles dates ne peuvent pas être dans le passé.'], 400);
        }

        // Prevent start date after end date
        if ($nouveauDebut->gt($nouveauFin)) {
            return response()->json(['message' => 'La date de début ne peut pas être après la date de fin.'], 400);
        }

        // Update the activity
        $activites->update($validated);

        // Log the update (label may be reused from creation)
        Logger::log(
            'info',
            'Création activité',
            'Une nouvelle activité a été créée',
            ['id' => $activites->act_id, "nom" => $activites->act_nom, "debut" => $activites->act_dateDebut],
            auth()->id()
        );

        return response()->json($activites);
    }

    // Delete an activity
    public function destroy($id)
    {
        $activites = Activites::find($id);

        if (!$activites) {
            return response()->json(['message' => 'Activité non trouvée'], 404);
        }

        $activites->delete();

        // Log activity deletion
        Logger::log(
            'info',
            'Supression activité',
            'Une activité a été supprimée',
            ['id' => $activites->act_id, "nom" => $activites->act_nom, "debut" => $activites->act_dateDebut],
            auth()->id()
        );

        return response()->json(['message' => 'Activité supprimée']);
    }
}
