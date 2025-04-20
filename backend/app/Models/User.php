<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Notifications\ResetPasswordNotification;


class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    public function sendTwoFactorCodeNotification()
    {
        $this->notify(new TwoFactorCodeNotification($this->two_factor_code));
    }

    public function generateTwoFactorCode()
    {
        $this->two_factor_code = rand(100000, 999999);
        $this->two_factor_expires_at = now()->addMinutes(10);
        $this->save();

        $this->sendTwoFactorCodeNotification();
    }


    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'password',
        'role',
        'telephone',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function getRoleEnum(): Role
    {
        return Role::from($this->role);
    }

    public function hasRole(Role $role): bool
    {
        return $this->role === $role->value;
    }


}


