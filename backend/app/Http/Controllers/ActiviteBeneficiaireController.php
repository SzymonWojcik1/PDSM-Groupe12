<?php

namespace App\Http\Controllers;

use App\Models\ActiviteBeneficiaire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Helpers\Logger;

class ActiviteBeneficiaireController extends Controller
{
    /**
     * Récupérer tous les bénéficiaires d'une activité
     */
    public function index($id)
    {
        $beneficiaires = DB::table('beneficiaires')
            ->join('activite_beneficiaire', 'beneficiaires.ben_id', '=', 'activite_beneficiaire.acb_ben_id')
            ->where('activite_beneficiaire.acb_act_id', $id)
            ->select('beneficiaires.*')
            ->get();

        return response()->json($beneficiaires);
    }

    /**
     * Ajouter un bénéficiaire à une activité
     */
    public function store(Request $request, $id)
    {
        $request->validate([
            'ben_id' => 'required|exists:beneficiaires,ben_id'
        ]);

        // Vérifier si l'association n'existe pas déjà
        $exists = ActiviteBeneficiaire::where('acb_act_id', $id)
            ->where('acb_ben_id', $request->ben_id)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Ce bénéficiaire est déjà inscrit à cette activité'
            ], 409);
        }

        // Créer l'association
        $activiteBeneficiaire = new ActiviteBeneficiaire();
        $activiteBeneficiaire->acb_act_id = $id;
        $activiteBeneficiaire->acb_ben_id = $request->ben_id;
        $activiteBeneficiaire->save();

        Logger::log(
            'info',
            'Ajout bénéficiaire à activité',
            'Un bénéficiaire a été inscrit à une activité',
            [
                'activite_id' => $id,
                'beneficiaire_id' => $request->ben_id
            ],
            auth()->id()
        );

        return response()->json([
            'message' => 'Bénéficiaire ajouté avec succès'
        ], 201);
    }

    /**
     * Retirer un bénéficiaire d'une activité
     */
    public function destroy($id, $beneficiaireId)
    {
        $deleted = ActiviteBeneficiaire::where('acb_act_id', $id)
            ->where('acb_ben_id', $beneficiaireId)
            ->delete();

        if (!$deleted) {
            return response()->json([
                'message' => 'Association non trouvée'
            ], 404);
        }

        Logger::log(
            'warning',
            'Retrait bénéficiaire d\'activité',
            'Un bénéficiaire a été retiré d\'une activité',
            [
                'activite_id' => $id,
                'beneficiaire_id' => $beneficiaireId
            ],
            auth()->id()
        );

        return response()->json([
            'message' => 'Bénéficiaire retiré avec succès'
        ]);
    }
}
