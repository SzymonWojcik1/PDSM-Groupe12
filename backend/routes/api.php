<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

// Controllers
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
use App\Http\Controllers\IndicateurActiviteController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\ActivitesImportController;
use App\Http\Controllers\LogController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/password/forgot', [PasswordResetController::class, 'sendResetLink']);
Route::post('/password/reset', [PasswordResetController::class, 'resetPassword']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {

    // Authentication & profile
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/2fa/verify', [AuthController::class, 'verifyTwoFactorCode']);

    // Enum values
    Route::get('/enums', [EnumController::class, 'enums']);

    // User management
    Route::controller(UserController::class)->group(function () {
        Route::get('/users', 'index');
        Route::post('/users', 'store');
        Route::get('/users/{id}', 'show');
        Route::put('/users/{id}', 'update');
        Route::delete('/users/{id}', 'destroy');
        Route::post('/users/{id}/partenaire', 'assignPartenaire');
        Route::get('/me', 'me');
    });

    // Beneficiary management
    Route::controller(BeneficiaireController::class)->group(function () {
        Route::get('/beneficiaires', 'index');
        Route::post('/beneficiaires', 'store');
        Route::get('/beneficiaires/{id}', 'show');
        Route::put('/beneficiaires/{id}', 'update');
        Route::delete('/beneficiaires/{id}', 'destroy');
        Route::post('/beneficiaires/check-duplicate', 'checkDuplicate');
    });

    // Partner management
    Route::controller(PartenaireController::class)->group(function () {
        Route::get('/partenaires', 'index');
        Route::post('/partenaires', 'store');
        Route::get('/partenaires/{id}', 'show');
        Route::put('/partenaires/{id}', 'update');
        Route::delete('/partenaires/{id}', 'destroy');
        Route::get('/partenaires/{id}/users', 'users');
    });

    // Project management
    Route::controller(ProjetController::class)->group(function () {
        Route::get('/projets', 'index');
        Route::post('/projets', 'store');
        Route::get('/projets/{id}', 'show');
        Route::put('/projets/{id}', 'update');
        Route::delete('/projets/{id}', 'destroy');
    });

    // Activity management
    Route::controller(ActivitesController::class)->group(function () {
        Route::get('/activites', 'index');
        Route::post('/activites', 'store');
        Route::get('/activites/{id}', 'show');
        Route::put('/activites/{id}', 'update');
        Route::delete('/activites/{id}', 'destroy');
        Route::post('/activites/import', 'import');
    });

    // Activity import (alternative route)
    Route::post('/activites/import', [ActivitesImportController::class, 'import']);

    // Link activities to beneficiaries
    Route::controller(ActiviteBeneficiaireController::class)->group(function () {
        Route::get('/activites/{id}/beneficiaires', 'index');
        Route::post('/activites/{id}/beneficiaires', 'store');
        Route::delete('/activites/{id}/beneficiaires/{beneficiaireId}', 'destroy');
        Route::post('/activites/{id}/beneficiaires/batch', 'batchStore');
    });

    // Logic frameworks (Cadre Logique)
    Route::controller(CadreLogiqueController::class)->group(function () {
        Route::get('/cadre-logique', 'index');
        Route::post('/cadre-logique', 'store');
        Route::get('/cadre-logique/{id}', 'show');
        Route::put('/cadre-logique/{id}', 'update');
        Route::delete('/cadre-logique/{id}', 'destroy');
        Route::get('/cadre-logique/{id}/structure', 'structure');
    });

    // General objectives
    Route::controller(ObjectifGeneralController::class)->group(function () {
        Route::get('/objectifs-generaux', 'index');
        Route::post('/objectifs-generaux', 'store');
        Route::get('/objectifs-generaux/{id}', 'show');
        Route::put('/objectifs-generaux/{id}', 'update');
        Route::delete('/objectifs-generaux/{id}', 'destroy');
    });

    // Outcomes
    Route::controller(OutcomeController::class)->group(function () {
        Route::get('/outcomes', 'index');
        Route::post('/outcomes', 'store');
        Route::get('/outcomes/{id}', 'show');
        Route::put('/outcomes/{id}', 'update');
        Route::delete('/outcomes/{id}', 'destroy');
    });

    // Outputs
    Route::controller(OutputController::class)->group(function () {
        Route::get('/outputs', 'index');
        Route::post('/outputs', 'store');
        Route::get('/outputs/{id}', 'show');
        Route::put('/outputs/{id}', 'update');
        Route::delete('/outputs/{id}', 'destroy');
    });

    // Indicators
    Route::controller(IndicateurController::class)->group(function () {
        Route::get('/indicateurs', 'index');
        Route::post('/indicateurs', 'store');
        Route::get('/indicateurs/{id}', 'show');
        Route::put('/indicateurs/{id}', 'update');
        Route::delete('/indicateurs/{id}', 'destroy');
    });

    // Indicators linked to activities
    Route::controller(IndicateurActiviteController::class)->group(function () {
        Route::get('/indicateur-activite', 'index');
        Route::post('/indicateur-activite', 'store');
        Route::get('/indicateur-activite/{id}', 'show');
        Route::delete('/indicateur-activite/{id}', 'destroy');
        Route::post('/indicateur-activite/batch', 'storeBatch');
        Route::get('/indicateur-activite/{id}/activites-with-count', 'getActivitesWithCount');
    });

    // Beneficiary counter per indicator
    Route::get('/indicateur/{id}/beneficiaires-count', function ($id) {
        $count = DB::table('activite_indicateur')
            ->join('activite_beneficiaire', 'activite_indicateur.act_id', '=', 'activite_beneficiaire.acb_act_id')
            ->where('activite_indicateur.ind_id', $id)
            ->distinct('activite_beneficiaire.acb_ben_id')
            ->count('activite_beneficiaire.acb_ben_id');

        return response()->json(['count' => $count]);
    });

    // Evaluations
    Route::controller(EvaluationController::class)->group(function () {
        Route::get('/evaluations', 'index');
        Route::post('/evaluations', 'store');
        Route::get('/evaluations/{id}', 'show');
        Route::patch('/evaluations/{id}/soumettre', 'updateStatut');
        Route::get('/mes-evaluations', 'mesEvaluations');
        Route::put('/evaluations/{id}', 'update');
        Route::get('/mes-evaluations/count', 'countMesEvaluations');
    });

    // Logs (restricted to 'siege' role in controller)
    Route::get('/logs', [LogController::class, 'index']);
});
