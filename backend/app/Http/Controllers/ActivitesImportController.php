<?php

namespace App\Http\Controllers;

use App\Models\Activites;
use App\Models\Partenaire;
use App\Models\Projet;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\Validator;
use App\Helpers\Logger;

class ActivitesImportController extends Controller
{
    public function import(Request $request): StreamedResponse
    {
        $userId = $request->user()?->id;

        // Log the import attempt
        Logger::log(
            'info',
            'Import activités',
            'Tentative d\'import d\'activités par fichier Excel.',
            [],
            $userId
        );

        if (!$request->hasFile('file') || !$request->file('file')->isValid()) {
            Logger::log(
                'error',
                'Import activités échoué',
                'Fichier manquant ou invalide.',
                [],
                $userId
            );

            return response()->json(['error' => 'Fichier invalide.'], 400);
        }

        $file = $request->file('file');
        $spreadsheet = IOFactory::load($file->getPathname());
        $worksheet = $spreadsheet->getActiveSheet();
        $rows = $worksheet->toArray(null, true, true, true);

        $errors = [];
        $validRows = [];

        $partenaires = Partenaire::pluck('part_id', 'part_nom')->mapWithKeys(fn($id, $nom) => [strtolower(trim($nom)) => $id]);
        $projets = Projet::pluck('pro_id', 'pro_nom')->mapWithKeys(fn($id, $nom) => [strtolower(trim($nom)) => $id]);

        foreach ($rows as $index => $row) {
            if ($index <= 2) continue; // Skip header + example

            $nomPartenaire = strtolower(trim($row['D'] ?? ''));
            $nomProjet = strtolower(trim($row['E'] ?? ''));

            $partenaireId = $partenaires[$nomPartenaire] ?? null;
            $projetId = $projets[$nomProjet] ?? null;

            $data = [
                'act_nom'       => $row['A'] ?? null,
                'act_dateDebut' => $row['B'] ?? null,
                'act_dateFin'   => $row['C'] ?? null,
                'act_part_id'   => $partenaireId,
                'act_pro_id'    => $projetId,
            ];

            $validator = Validator::make($data, [
                'act_nom'       => 'required|string|max:255',
                'act_dateDebut' => 'required|date',
                'act_dateFin'   => 'required|date|after_or_equal:act_dateDebut',
                'act_part_id'   => 'required|exists:partenaires,part_id',
                'act_pro_id'    => 'required|exists:projet,pro_id',
            ]);

            if ($validator->fails()) {
                $errors[] = [
                    'ligne' => $index,
                    'data' => $data,
                    'messages' => $validator->errors()->toArray(),
                ];
            } else {
                $validRows[] = $data;
            }
        }

        // Log the number of valid and invalid rows
        if (!empty($errors)) {

            $headers = array_keys($errors[0]['data']);
            $csvHeaders = array_merge(['ligne'], $headers, ['colonnes_fautives']);

            $callback = function () use ($errors, $headers, $csvHeaders) {
                $output = fopen('php://output', 'w');
                fputcsv($output, $csvHeaders);

                foreach ($errors as $error) {
                    $row = [$error['ligne']];
                    foreach ($headers as $field) {
                        $row[] = $error['data'][$field] ?? '';
                    }
                    $colonnesFautives = implode(', ', array_keys($error['messages']));
                    $row[] = $colonnesFautives;

                    fputcsv($output, $row);
                }

                fclose($output);
            };

            return response()->streamDownload($callback, 'erreurs_import_activites.csv', [
                'Content-Type' => 'text/csv',
            ]);
        }

        foreach ($validRows as $data) {
            Activites::create($data);
        }

        return response()->json([
            'message' => 'Import terminé avec succès.',
            'lignes_importées' => count($validRows),
        ]);
    }
}
