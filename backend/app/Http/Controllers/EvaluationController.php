<?php

namespace App\Http\Controllers;

use App\Models\Evaluation;
use App\Models\User;
use Illuminate\Http\Request;
use App\Helpers\Logger;

class EvaluationController extends Controller
{
    public function index()
    {
        return Evaluation::with('utilisateur')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'part_id' => 'required|exists:partenaires,part_id',
            'criteres' => 'required|array|min:1',
            'criteres.*.label' => 'required|string',
            'criteres.*.reussi' => 'required|boolean',
        ]);

        $users = User::where('partenaire_id', $request->part_id)->get();

        if ($users->isEmpty()) {
            return response()->json(['error' => 'Aucun utilisateur trouvé pour ce partenaire.'], 404);
        }

        $evaluations = [];
        $userIds = [];

        foreach ($users as $user) {
            $evaluations[] = Evaluation::create([
                'eva_use_id' => $user->id,
                'criteres' => $request->criteres,
                'eva_statut' => 'en_attente',
                'eva_date_soumission' => now(),
            ]);

            $userIds[] = $user->id;
        }

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


    public function show($id)
    {
        return Evaluation::with('utilisateur')->findOrFail($id)->makeHidden([]);
    }

    public function updateStatut(Request $request, $id)
    {
        $request->validate([
            'eva_statut' => 'required|in:en_attente,soumis,valide',
        ]);

        $evaluation = Evaluation::findOrFail($id);
        $evaluation->update([
            'eva_statut' => $request->eva_statut,
            'eva_date_soumission' => now(),
        ]);

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

    public function update(Request $request, $id)
    {
        $evaluation = Evaluation::findOrFail($id);

        $reponses = $request->input('reponses'); // Ex: [0 => 'reussi', 1 => 'non_reussi']
        $criteres = $evaluation->criteres; // array casté automatiquement

        foreach ($criteres as $index => &$critere) {
            if (isset($reponses[$index])) {
                $critere['reussi'] = $reponses[$index] === 'reussi';
            }
        }

        $evaluation->criteres = $criteres;
        $evaluation->eva_statut = 'soumis';
        $evaluation->eva_date_soumission = now();
        $evaluation->save();

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

    public function countMesEvaluations(Request $request)
    {
        $userId = $request->query('user_id');

        $count = Evaluation::where('eva_use_id', $userId)
            ->where('eva_statut', 'en_attente')
            ->count();

        return response()->json(['count' => $count]);
    }
}
