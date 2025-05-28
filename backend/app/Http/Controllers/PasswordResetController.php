<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;
use App\Helpers\Logger;

class PasswordResetController extends Controller
{
    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            Logger::log(
                'info',
                'Envoi lien réinitialisation',
                'Lien de réinitialisation envoyé par email',
                ['email' => $request->email],
                $user->id
            );

            return response()->json(['message' => 'Lien envoyé par e-mail.']);
        } else {
            Logger::log(
                'info',
                'Échec envoi lien réinitialisation',
                'Échec de l’envoi du lien de réinitialisation',
                ['email' => $request->email],
                $user->id
            );

            return response()->json(['message' => 'Impossible d’envoyer le lien.'], 400);
        }
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required',
            'password' => [
                'required',
                'confirmed',
                'min:8',
                'regex:/[A-Z]/',
                'regex:/[!@#$%^&*(),.?":{}|<>]/'
            ],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                Logger::log(
                    'info',
                    'Mot de passe réinitialisé',
                    'Réinitialisation réussie',
                    ['email' => $user->email],
                    $user->id
                );

                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
        } else {
            Logger::log(
                'info',
                'Échec réinitialisation mot de passe',
                'La réinitialisation a échoué',
                ['email' => $request->email],
                $user->id
            );

            return response()->json(['message' => 'Échec de la réinitialisation.'], 400);
        }
    }
}
