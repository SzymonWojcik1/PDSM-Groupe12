<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BeneficiaireExportTemplateController;
use App\Http\Controllers\ActiviteExportTemplateController;


Route::get('/modele-import-activites', function () {
    $path = storage_path('app/public/modele_import_activites.csv');

    if (!file_exists($path)) {
        return response()->json(['message' => 'Fichier non trouvé'], 404);
    }

    return response()->download($path, 'modele_import_activites.csv');
});

Route::get('/beneficiaires/template', [BeneficiaireExportTemplateController::class, 'downloadTemplate']);
Route::get('/activites/template', [ActiviteExportTemplateController::class, 'downloadTemplate']);
//Route::post('/beneficiaires/import', [\App\Http\Controllers\BeneficiaireImportController::class, 'import']);