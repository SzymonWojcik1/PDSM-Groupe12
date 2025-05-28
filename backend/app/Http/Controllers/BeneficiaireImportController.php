<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Border;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\StreamedResponse;
use App\Enums\Genre;
use App\Enums\Sexe;
use App\Enums\Type;
use App\Enums\Zone;
use App\Models\Beneficiaire;

class BeneficiaireImportController extends Controller
{
    // Handles the import of beneficiaries from an uploaded Excel file
    public function import(Request $request): StreamedResponse
    {
        // Check if a valid file is uploaded
        if (!$request->hasFile('file') || !$request->file('file')->isValid()) {
            return response()->json(['error' => 'Fichier invalide.'], 400);
        }

        $file = $request->file('file');
        $spreadsheet = IOFactory::load($file->getPathname());
        $worksheet = $spreadsheet->getActiveSheet();
        $rows = $worksheet->toArray(null, true, true, true);

        // Get lists of valid values from config and enums
        $regions = array_keys(config('regions'));
        $pays = collect(config('regions'))->flatten()->unique()->toArray();
        $types = array_column(Type::cases(), 'value');
        $sexes = array_column(Sexe::cases(), 'value');
        $genres = array_column(Genre::cases(), 'value');
        $zones = array_column(Zone::cases(), 'value');

        $errors = [];
        $validRows = [];
        $doublons = [];

        // Loop through each row in the Excel file (skip header and example rows)
        foreach ($rows as $index => $row) {
            if ($index <= 2) continue;

            // Map Excel columns to beneficiary fields
            $data = [
                'ben_prenom'         => $row['A'] ?? null,
                'ben_nom'            => $row['B'] ?? null,
                'ben_date_naissance' => $row['C'] ?? null,
                'ben_region'         => $row['D'] ?? null,
                'ben_pays'           => $row['E'] ?? null,
                'ben_type'           => $row['F'] ?? null,
                'ben_type_autre'     => $row['G'] ?? null,
                'ben_zone'           => $row['H'] ?? null,
                'ben_sexe'           => $row['I'] ?? null,
                'ben_sexe_autre'     => $row['J'] ?? null,
                'ben_genre'          => $row['K'] ?? null,
                'ben_genre_autre'    => $row['L'] ?? null,
                'ben_ethnicite'      => $row['M'] ?? null,
            ];

            // Validate the row data
            $validator = Validator::make($data, [
                'ben_prenom' => ['required', 'string', 'max:50', 'regex:/^[\p{L}\-\']+$/u'],
                'ben_nom'    => ['required', 'string', 'max:50', 'regex:/^[\p{L}\-\']+$/u'],
                'ben_date_naissance' => ['required', 'date_format:Y-m-d'],
                'ben_region' => ['required', 'in:' . implode(',', $regions)],
                'ben_pays'   => ['required', 'in:' . implode(',', $pays)],
                'ben_type'   => ['required', 'in:' . implode(',', $types)],
                'ben_type_autre' => ['required_if:ben_type,other', 'nullable', 'string', 'max:100', 'regex:/^[\p{L}\-\']+$/u'],
                'ben_sexe'   => ['required', 'in:' . implode(',', $sexes)],
                'ben_sexe_autre'   => ['required_if:ben_sexe,other', 'nullable', 'string', 'max:100', 'regex:/^[\p{L}\-\']+$/u'],
                'ben_genre'  => ['nullable', 'in:' . implode(',', $genres)],
                'ben_genre_autre' => ['required_if:ben_genre,other', 'nullable', 'string', 'max:100', 'regex:/^[\p{L}\-\']+$/u'],
                'ben_zone'   => ['required', 'in:' . implode(',', $zones)],
                'ben_ethnicite' => ['required', 'string', 'max:50', 'regex:/^[\p{L}\-\']+$/u'],
            ], [
                // Custom error messages for validation failures
                'ben_prenom.regex' => 'Le prénom ne peut contenir que des lettres, des tirets ou des apostrophes.',
                'ben_nom.regex' => 'Le nom ne peut contenir que des lettres, des tirets ou des apostrophes.',
                'ben_date_naissance.date_format' => 'La date doit être au format YYYY-MM-DD.',
                'ben_region.in' => 'Région non valide.',
                'ben_pays.in' => 'Pays non valide.',
                'ben_type.in' => 'Type non valide.',
                'ben_type_autre.required_if' => 'Le champ "Type (autre)" est requis lorsque le type est "other".',
                'ben_type_autre.regex' => 'Le champ "Type (autre)" ne peut contenir que des lettres, des tirets ou des apostrophes.',
                'ben_sexe.in' => 'Sexe non valide.',
                'ben_sexe_autre.required_if' => 'Le champ "Sexe (autre)" est requis lorsque le sexe est "other".',
                'ben_sexe_autre.regex' => 'Le champ "Sexe (autre)" ne peut contenir que des lettres, des tirets ou des apostrophes.',
                'ben_genre.in' => 'Genre non valide.',
                'ben_genre_autre.required_if' => 'Le champ "Genre (autre)" est requis lorsque le genre est "other".',
                'ben_genre_autre.regex' => 'Le champ "Genre (autre)" ne peut contenir que des lettres, des tirets ou des apostrophes.',
                'ben_zone.in' => 'Zone non valide.',
                'ben_ethnicite.regex' => 'ethnicite ne peut contenir que des lettres, des tirets ou des apostrophes.',
            ]);

            // If validation fails, add to errors array
            if ($validator->fails()) {
                $errors[] = [
                    'ligne' => $index,
                    'data' => $data,
                    'messages' => $validator->errors()->toArray(),
                ];
            } else {
                // Check for duplicate beneficiary in the database
                $existing = Beneficiaire::where('ben_nom', $data['ben_nom'])
                    ->where('ben_prenom', $data['ben_prenom'])
                    ->where('ben_date_naissance', $data['ben_date_naissance'])
                    ->where('ben_sexe', $data['ben_sexe'])
                    ->first();

                if ($existing) {
                    // If duplicate found, add to duplicates array
                    $doublons[] = [
                        'ligne' => $index,
                        'data' => $data,
                        'existant' => [
                            'id' => $existing->id,
                            'nom' => $existing->ben_nom,
                            'prenom' => $existing->ben_prenom,
                            'created_at' => $existing->created_at->format('d/m/Y'),
                        ]
                    ];
                } else {
                    // If valid and not duplicate, add to validRows array
                    $validRows[] = $data;
                }
            }
        }

        // If there are errors, return a CSV file with error details
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

            return response()->streamDownload($callback, 'erreurs_import_beneficiaires.csv', [
                'Content-Type' => 'text/csv',
            ]);
        }

        // Insert all valid rows into the database
        Beneficiaire::insert($validRows);

        // If there are duplicates, return a JSON response with details
        if (!empty($doublons)) {
            return response()->json([
                'message' => 'Import partiel : certains doublons ont été détectés.',
                'lignes_importées' => count($validRows),
                'doublons' => $doublons,
            ]);
        }

        // If everything is fine, return a success message
        return response()->json([
            'message' => 'Import terminé avec succès.',
            'lignes_importées' => count($validRows),
        ]);
    }

    // Stores a beneficiary even if it is a confirmed duplicate
    public function storeConfirmedDuplicate(Request $request)
    {
        // Validate the incoming data
        $data = $request->validate([
            'ben_prenom'         => ['required', 'string', 'max:50', 'regex:/^[\p{L}\-\']+$/u'],
            'ben_nom'            => ['required', 'string', 'max:50', 'regex:/^[\p{L}\-\']+$/u'],
            'ben_date_naissance' => ['required', 'date_format:Y-m-d'],
            'ben_region'         => ['required', 'string'],
            'ben_pays'           => ['required', 'string'],
            'ben_type'           => ['required', 'string'],
            'ben_type_autre'     => ['nullable', 'string', 'max:100'],
            'ben_zone'           => ['nullable', 'string'],
            'ben_sexe'           => ['required', 'string'],
            'ben_sexe_autre'     => ['nullable', 'string', 'max:100'],
            'ben_genre'          => ['nullable', 'string'],
            'ben_genre_autre'    => ['nullable', 'string', 'max:100'],
            'ben_ethnicite'      => ['required', 'string', 'max:50'],
        ]);

        // Create the beneficiary in the database
        $beneficiaire = Beneficiaire::create($data);

        // Return a success response
        return response()->json([
            'message' => 'Doublon enregistré avec succès.',
            'beneficiaire' => $beneficiaire,
        ]);
    }
}