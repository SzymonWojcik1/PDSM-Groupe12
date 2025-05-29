<?php

namespace App\Http\Controllers;

use App\Models\Evaluation;
use App\Models\User;
use Illuminate\Http\Request;
use App\Helpers\Logger;

class EvaluationController extends Controller
{
    // Return all evaluations with their associated users
    public function index()
    {
        return Evaluation::with('utilisateur')->get();
    }

    // Create evaluations for all users linked to a given partner
    public function store(Request $request)
    {
        // Validate request data, including nested criteria
        $request->validate([
            'part_id' => 'required|exists:partenaires,part_id',
            'criteres' => 'required|array|min:1',
            'criteres.*.label' => 'required|string',
            'criteres.*.reussi' => 'required|boolean',
        ]);

        // Retrieve all users associated with the specified partner
        $users = User::where('partenaire_id', $request->part_id)->get();

        if ($users->isEmpty()) {
            return response()->json(['error' => 'Aucun utilisateur trouvé pour ce partenaire.'], 404);
        }

        $evaluations = [];
        $userIds = [];

        // Create one evaluation per user
        foreach ($users as $user) {
            $evaluations[] = Evaluation::create([
                'eva_use_id' => $user->id,
                'criteres' => $request->criteres,
                'eva_statut' => 'en_attente',
                'eva_date_soumission' => now(),
            ]);

            $userIds[] = $user->id;
        }

        // Log creation of evaluations
        Logger::log(
            'info',
            'Création évaluation',
            'Des évaluations ont été créées pour tous les utilisateurs du partenaire.',
            [
                'partenaire_nom' => $request->part_nom,
                'nb_evaluations' => count($evaluations),
                'user_ids' => $userIds
            ],
            auth()->id()
        );

        return response()->json([
            'message' => count($evaluations) . ' évaluation(s) créée(s)',
            'evaluations' => $evaluations
        ], 201);
    }

    // Show one evaluation with its associated user
    public function show($id)
    {
        return Evaluation::with('utilisateur')->findOrFail($id)->makeHidden([]);
    }

    // Update the status of an evaluation
    public function updateStatut(Request $request, $id)
    {
        // Ensure the new status is valid
        $request->validate([
            'eva_statut' => 'required|in:en_attente,soumis,valide',
        ]);

        $evaluation = Evaluation::findOrFail($id);
        $evaluation->update([
            'eva_statut' => $request->eva_statut,
            'eva_date_soumission' => now(),
        ]);

        // Log status change
        Logger::log(
            'info',
            'Changement de statut d\'évaluation',
            'Le statut d\'une évaluation a été modifié.',
            [
                'evaluation_id' => $evaluation->eva_id,
                'nouveau_statut' => $request->eva_statut
            ],
            auth()->id()
        );

        return response()->json($evaluation);
    }

    // Retrieve all pending evaluations for a specific user
    public function mesEvaluations(Request $request)
    {
        $user = User::find($request->query('user_id'));

        if (!$user) {
            return response()->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        $evaluations = Evaluation::where('eva_use_id', $user->id)
                        ->where('eva_statut', 'en_attente')
                        ->get();

        return response()->json($evaluations);
    }

    // Update evaluation with answers (marking criteria as passed or not)
    public function update(Request $request, $id)
    {
        $evaluation = Evaluation::findOrFail($id);

        // Expected format: array of objects like: [ ['label' => '...', 'reussi' => true], ... ]
        $reponses = $request->input('reponses');

        // Validate format: array with label and reussi fields
        if (!is_array($reponses)) {
            return response()->json(['error' => 'Format invalide pour les réponses'], 400);
        }

        // Rebuild criteres array from validated reponses
        $criteres = [];
        foreach ($reponses as $rep) {
            if (!isset($rep['label']) || !isset($rep['reussi'])) {
                return response()->json(['error' => 'Chaque critère doit avoir un label et un champ reussi'], 400);
            }

            $criteres[] = [
                'label' => $rep['label'],
                'reussi' => (bool) $rep['reussi'] // Assure que la valeur est bien un booléen
            ];
        }

        // Save updated evaluation
        $evaluation->criteres = $criteres;
        $evaluation->eva_statut = 'soumis';
        $evaluation->eva_date_soumission = now();
        $evaluation->save();

        // Log submission
        Logger::log(
            'info',
            'Soumission d\'évaluation',
            'Une évaluation a été remplie par l\'utilisateur.',
            [
                'evaluation_id' => $evaluation->eva_id,
                'reponses' => $reponses
            ],
            auth()->id()
        );

        return response()->json(['message' => 'Évaluation mise à jour']);
    }


    // Return the count of pending evaluations for a specific user
    public function countMesEvaluations(Request $request)
    {
        $userId = $request->query('user_id');

        $count = Evaluation::where('eva_use_id', $userId)
            ->where('eva_statut', 'en_attente')
            ->count();

        return response()->json(['count' => $count]);
    }
}
