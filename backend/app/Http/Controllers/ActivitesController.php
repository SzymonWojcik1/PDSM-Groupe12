<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Activites;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\StreamedResponse;

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

    public function import(Request $request)
    {
        if (!$request->hasFile('file')) {
            return response()->json(['message' => 'Fichier manquant.'], 400);
        }

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');

        $header = fgetcsv($handle, 1000, ';'); // séparateur ;

        $errors = [];
        $inserted = 0;

        while (($data = fgetcsv($handle, 1000, ';')) !== false) {
            $row = array_combine($header, $data);

            $validator = Validator::make($row, [
                'Nom' => 'required|string|max:255',
                'Début' => 'required|date|after:now',
                'Fin' => 'required|date|after_or_equal:Début',
                'Partenaire' => 'required|string',
                'Projet' => 'required|string',
            ]);

            if ($validator->fails()) {
                $row['Erreur'] = implode(' | ', $validator->errors()->all());
                $errors[] = $row;
                continue;
            }

            // Recherche des IDs
            $partenaire = \App\Models\Partenaire::where('part_nom', $row['Partenaire'])->first();
            $projet = \App\Models\Projet::where('pro_nom', $row['Projet'])->first();

            if (!$partenaire || !$projet) {
                $row['Erreur'] = 'Partenaire ou projet introuvable';
                $errors[] = $row;
                continue;
            }

            // Vérification de doublon
            $exists = \App\Models\Activites::whereRaw('LOWER(act_nom) = ?', [strtolower($row['Nom'])])
                ->where('act_dateDebut', $row['Début'])
                ->where('act_dateFin', $row['Fin'])
                ->where('act_pro_id', $projet->pro_id)
                ->exists();

            if ($exists) {
                $row['Erreur'] = 'Doublon détecté';
                $errors[] = $row;
                continue;
            }

            \App\Models\Activites::create([
                'act_nom' => $row['Nom'],
                'act_dateDebut' => $row['Début'],
                'act_dateFin' => $row['Fin'],
                'act_part_id' => $partenaire->part_id,
                'act_pro_id' => $projet->pro_id,
            ]);

            $inserted++;
        }

        fclose($handle);

        if (count($errors) > 0) {
            $errorFileName = 'activites_erreurs_' . now()->timestamp . '.csv';
            $path = storage_path('app/public/' . $errorFileName);

            $fp = fopen($path, 'w');
            fputcsv($fp, array_keys($errors[0]), ';');

            foreach ($errors as $row) {
                fputcsv($fp, $row, ';');
            }

            fclose($fp);

            return response()->json([
                'message' => "$inserted lignes importées, " . count($errors) . " en erreur.",
                'fichier_erreurs' => asset("storage/$errorFileName"),
            ], 207); // 207 = Multi-Status
        }

        return response()->json(['message' => "$inserted lignes importées avec succès."]);
    }
}
