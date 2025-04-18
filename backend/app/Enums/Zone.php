<?php

namespace App\Enums;

enum Zone: string
{
    case URBAINE = 'urban';
    case PERIURBAINE = 'periurban';
    case RURALE = 'rural';

    public function label(): string
    {
        return __('zones.' . $this->value);
    }
}