<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\BeneficiaireController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\EnumController;
use App\Http\Controllers\PartenaireController;
use App\Http\Controllers\ProjetController;
use App\Http\Controllers\ActivitesController;
use App\Http\Controllers\ActiviteBeneficiaireController;
use App\Http\Controllers\CadreLogiqueController;
use App\Http\Controllers\ObjectifGeneralController;
use App\Http\Controllers\OutcomeController;
use App\Http\Controllers\OutputController;
use App\Http\Controllers\IndicateurController;



Route::post('/login', [AuthController::class, 'login']);
Route::post('/password/forgot', [PasswordResetController::class, 'sendResetLink']);
Route::post('/password/reset', [PasswordResetController::class, 'resetPassword']);


// Beneficiaire
Route::post('/beneficiaires', [BeneficiaireController::class, 'store']);
Route::get('/beneficiaires', [BeneficiaireController::class, 'index']);
Route::get('/beneficiaires/{id}', [BeneficiaireController::class, 'show']);
Route::put('/beneficiaires/{id}', [BeneficiaireController::class, 'update']);
Route::delete('/beneficiaires/{id}', [BeneficiaireController::class, 'destroy']);

// Enums
Route::get('/enums', [EnumController::class, 'enums']);


Route::middleware('auth:sanctum')->group(function () {
    // User
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::post('/users/{id}/partenaire', [UserController::class, 'assignPartenaire']);


    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/2fa/verify', [AuthController::class, 'verifyTwoFactorCode']);

});


Route::controller(PartenaireController::class)->group(function(){
    Route::get('/partenaires', [PartenaireController::class, 'index']);
    Route::post('/partenaires', [PartenaireController::class, 'store']);
    Route::delete('/partenaires/{id}', [PartenaireController::class, 'destroy']);
    Route::put('/partenaires/{id}', [PartenaireController::class, 'update']);
    Route::get('/partenaires/{id}', [PartenaireController::class, 'show']);
    Route::get('/partenaires/{id}/users', [PartenaireController::class, 'users']);
});


Route::controller(ProjetController::class)->group(function(){
    Route::get('/projets', [ProjetController::class, 'index']);
    Route::post('/projets', [ProjetController::class, 'store']);
    Route::get('/projets/{id}', [ProjetController::class, 'show']);
    Route::put('/projets/{id}', [ProjetController::class, 'update']);
    Route::delete('/projets/{id}', [ProjetController::class, 'destroy']);
});


Route::controller(ActivitesController::class)->group(function(){
    Route::get('/activites', [ActivitesController::class, 'index']);
    Route::post('/activites', [ActivitesController::class, 'store']);
    Route::get('/activites/{id}', [ActivitesController::class, 'show']);
    Route::put('/activites/{id}', [ActivitesController::class, 'update']);
    Route::delete('/activites/{id}', [ActivitesController::class, 'destroy']);
    Route::post('/activites/import', [ActivitesController::class, 'import']);
    Route::get('/activites/template', function () {
        $path = storage_path('app/public/modele_import_activites.csv');
        if (!file_exists($path)) {
            return response()->json(['message' => 'Fichier non trouvé'], 404);
        }
        return response()->download($path, 'modele_import_activites.csv');
    });
    
});

// Routes pour la gestion des bénéficiaires d'une activité
Route::controller(ActiviteBeneficiaireController::class)->group(function(){
    Route::get('/activites/{id}/beneficiaires', 'index');
    Route::post('/activites/{id}/beneficiaires', 'store');
    Route::delete('/activites/{id}/beneficiaires/{beneficiaireId}', 'destroy');
});

// Route pour le cadre logique
Route::controller(CadreLogiqueController::class)->group(function(){
    Route::get('/cadre-logique', [CadreLogiqueController::class, 'index']);
    Route::post('/cadre-logique', [CadreLogiqueController::class, 'store']);
    Route::get('/cadre-logique/{id}', [CadreLogiqueController::class, 'show']);
    Route::put('/cadre-logique/{id}', [CadreLogiqueController::class, 'update']);
    Route::delete('/cadre-logique/{id}', [CadreLogiqueController::class, 'destroy']);
});

// Routes pour les objectifs généraux
Route::controller(ObjectifGeneralController::class)->group(function(){
    Route::get('/objectifs-generaux', [ObjectifGeneralController::class, 'index']);
    Route::post('/objectifs-generaux', [ObjectifGeneralController::class, 'store']);
    Route::get('/objectifs-generaux/{id}', [ObjectifGeneralController::class, 'show']);
    Route::put('/objectifs-generaux/{id}', [ObjectifGeneralController::class, 'update']);
    Route::delete('/objectifs-generaux/{id}', [ObjectifGeneralController::class, 'destroy']);
});

// Routes pour les outcomes
Route::controller(OutcomeController::class)->group(function(){
    Route::get('/outcomes', [OutcomeController::class, 'index']);
    Route::post('/outcomes', [OutcomeController::class, 'store']);
    Route::get('/outcomes/{id}', [OutcomeController::class, 'show']);
    Route::put('/outcomes/{id}', [OutcomeController::class, 'update']);
    Route::delete('/outcomes/{id}', [OutcomeController::class, 'destroy']);
});

// Routes pour les outputs
Route::controller(OutputController::class)->group(function(){
    Route::get('/outputs', [OutputController::class, 'index']);
    Route::post('/outputs', [OutputController::class, 'store']);
    Route::get('/outputs/{id}', [OutputController::class, 'show']);
    Route::put('/outputs/{id}', [OutputController::class, 'update']);
    Route::delete('/outputs/{id}', [OutputController::class, 'destroy']);
});

// Routes pour les indicateurs
Route::controller(IndicateurController::class)->group(function(){
    Route::get('/indicateurs', [IndicateurController::class, 'index']);
    Route::post('/indicateurs', [IndicateurController::class, 'store']);
    Route::get('/indicateurs/{id}', [IndicateurController::class, 'show']);
    Route::put('/indicateurs/{id}', [IndicateurController::class, 'update']);
    Route::delete('/indicateurs/{id}', [IndicateurController::class, 'destroy']);
});
