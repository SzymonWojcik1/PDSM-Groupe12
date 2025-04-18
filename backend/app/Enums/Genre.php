<?php

namespace App\Enums;

enum Genre: string
{
    case CIS_HETERO = 'cis_hetero';
    case HOMO = 'homosexual';
    case BI = 'bisexual';
    case TRANS = 'transsexual';
    case NON_BINAIRE = 'non_binary';
    case FLUIDE = 'gender_fluid';
    case AUTRE = 'other';

    public function label(): string
    {
        return __('genre.' . $this->value);
    }
}