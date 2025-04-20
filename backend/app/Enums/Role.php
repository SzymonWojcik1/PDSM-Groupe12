<?php

namespace App\Enums;

enum Role: string
{
    case UTILISATEUR = 'utilisateur';
    case CN = 'cn';
    case CR = 'cr';
    case SIEGE = 'siege';
}
