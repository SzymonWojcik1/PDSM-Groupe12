<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\BeneficiaireController;
use App\Http\Controllers\UserController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);

// Beneficiaire
Route::post('/beneficiaires', [BeneficiaireController::class, 'store']);
Route::get('/beneficiaires', [BeneficiaireController::class, 'index']);
Route::get('/beneficiaires/{id}', [BeneficiaireController::class, 'show']);
Route::put('/beneficiaires/{id}', [BeneficiaireController::class, 'update']);
Route::delete('/beneficiaires/{id}', [BeneficiaireController::class, 'destroy']);

Route::middleware('auth:sanctum')->group(function () {
    // User
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/2fa/verify', [AuthController::class, 'verifyTwoFactorCode']);

});
