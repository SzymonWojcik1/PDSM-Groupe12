<?php

namespace App\Enums;

enum Sexe: string
{
    case HOMME = 'male';
    case FEMME = 'female';
    case AUTRE = 'other';

    public function label(): string
    {
        return __('sexe.' . $this->value);
    }
}