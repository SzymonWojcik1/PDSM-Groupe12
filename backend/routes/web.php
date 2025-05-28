<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BeneficiaireExportTemplateController;
use App\Http\Controllers\ActiviteExportTemplateController;

// Route to download the static CSV template for activities
Route::get('/modele-import-activites', function () {
    $path = storage_path('app/public/modele_import_activites.csv');

    // Return 404 if the file does not exist
    if (!file_exists($path)) {
        return response()->json(['message' => 'Fichier non trouvé'], 404);
    }

    // Download the CSV file
    return response()->download($path, 'modele_import_activites.csv');
});

// Route to download the Excel template for beneficiaries
Route::get('/beneficiaires/template', [BeneficiaireExportTemplateController::class, 'downloadTemplate']);

// Route to download the Excel template for activities
Route::get('/activites/template', [ActiviteExportTemplateController::class, 'downloadTemplate']);