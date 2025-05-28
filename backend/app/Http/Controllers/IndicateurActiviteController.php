<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\IndicateurActivite;
use App\Models\Activite;
use App\Helpers\Logger;

class IndicateurActiviteController extends Controller
{
    public function index()
    {
        return IndicateurActivite::with(['activite', 'indicateur'])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'act_id' => 'required|exists:activites,act_id',
            'ind_id' => 'required|exists:indicateur,ind_id',
        ]);

        $item = IndicateurActivite::create($validated);

        Logger::log(
            'info',
            'Lien indicateur-activité créé',
            'Un lien a été créé entre une activité et un indicateur',
            ['act_id' => $item->act_id, 'ind_id' => $item->ind_id],
            auth()->id()
        );

        return $item;
    }

    public function show($id)
    {
        return IndicateurActivite::with(['activite', 'indicateur'])->findOrFail($id);
    }

    public function destroy($id)
    {
        $item = IndicateurActivite::findOrFail($id);
        $item->delete();

        Logger::log(
            'info',
            'Lien indicateur-activité supprimé',
            'Le lien entre une activité et un indicateur a été supprimé',
            ['act_id' => $item->act_id, 'ind_id' => $item->ind_id],
            auth()->id()
        );

        return response()->json(['message' => 'Lien supprimé avec succès']);
    }

    public function getActivitesWithCount($id)
    {
        $links = IndicateurActivite::with('activite')
            ->where('ind_id', $id)
            ->get();

        $result = $links->map(function ($link) {
            $act = $link->activite;
            if (!$act) return null;

            $count = $act->beneficiaires()->count();

            return [
                'act_id' => $act->act_id,
                'act_nom' => $act->act_nom,
                'act_dateDebut' => $act->act_dateDebut,
                'act_dateFin' => $act->act_dateFin,
                'nbBeneficiaires' => $count,
            ];
        })->filter();

        return response()->json($result->values());
    }

    public function storeBatch(Request $request)
    {
        $validated = $request->validate([
            'ind_id' => 'required|exists:indicateur,ind_id',
            'act_ids' => 'required|array',
            'act_ids.*' => 'exists:activites,act_id',
        ]);

        $indId = $validated['ind_id'];
        $actIds = $validated['act_ids'];

        $alreadyLinked = IndicateurActivite::where('ind_id', $indId)
            ->whereIn('act_id', $actIds)
            ->pluck('act_id')
            ->toArray();

        $newLinks = array_diff($actIds, $alreadyLinked);

        $data = collect($newLinks)->map(fn($actId) => [
            'ind_id' => $indId,
            'act_id' => $actId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        IndicateurActivite::insert($data->toArray());

        Logger::log(
            'info',
            'Liens indicateur-activités créés en lot',
            'Des liens ont été créés entre un indicateur et plusieurs activités',
            ['ind_id' => $indId, 'act_ids' => array_values($newLinks)],
            auth()->id()
        );

        return response()->json(['message' => 'Activités liées avec succès', 'count' => count($data)]);
    }
}
