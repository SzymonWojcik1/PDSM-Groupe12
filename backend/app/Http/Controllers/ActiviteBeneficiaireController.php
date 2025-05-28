<?php

namespace App\Http\Controllers;

use App\Models\ActiviteBeneficiaire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Helpers\Logger;

/**
 * Controller for managing the relationship between Activities and Beneficiaries
 * Handles operations like listing beneficiaries of an activity,
 * adding a beneficiary to an activity, and removing a beneficiary from an activity
 */
class ActiviteBeneficiaireController extends Controller
{
    /**
     * Get all beneficiaries associated with a specific activity
     * 
     * @param int $id The ID of the activity
     * @return \Illuminate\Http\JsonResponse List of beneficiaries
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
     * Add a beneficiary to an activity
     * 
     * @param Request $request The HTTP request containing beneficiary ID
     * @param int $id The ID of the activity
     * @return \Illuminate\Http\JsonResponse Success or error message
     * @throws \Illuminate\Validation\ValidationException If validation fails
     */
    public function store(Request $request, $id)
    {
        // Validate that the beneficiary exists
        $request->validate([
            'ben_id' => 'required|exists:beneficiaires,ben_id'
        ]);

        // Check if the association already exists
        $exists = ActiviteBeneficiaire::where('acb_act_id', $id)
            ->where('acb_ben_id', $request->ben_id)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Ce bénéficiaire est déjà inscrit à cette activité'
            ], 409);
        }

        // Create the association between activity and beneficiary
        $activiteBeneficiaire = new ActiviteBeneficiaire();
        $activiteBeneficiaire->acb_act_id = $id;
        $activiteBeneficiaire->acb_ben_id = $request->ben_id;
        $activiteBeneficiaire->save();

        // Log the action
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
     * Remove a beneficiary from an activity
     * 
     * @param int $id The ID of the activity
     * @param int $beneficiaireId The ID of the beneficiary to remove
     * @return \Illuminate\Http\JsonResponse Success or error message
     */
    public function destroy($id, $beneficiaireId)
    {
        // Delete the association between activity and beneficiary
        $deleted = ActiviteBeneficiaire::where('acb_act_id', $id)
            ->where('acb_ben_id', $beneficiaireId)
            ->delete();

        if (!$deleted) {
            return response()->json([
                'message' => 'Association non trouvée'
            ], 404);
        }

        // Log the action
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
