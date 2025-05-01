<?php

use Illuminate\Support\Facades\Route;


Route::get('/modele-import-activites', function () {
    $path = storage_path('app/public/modele_import_activites.csv');

    if (!file_exists($path)) {
        return response()->json(['message' => 'Fichier non trouvé'], 404);
    }

    return response()->download($path, 'modele_import_activites.csv');
});
