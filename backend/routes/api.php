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
});
