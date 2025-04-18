<?php

namespace App\Enums;

enum Type: string
{
    case ENFANT = 'child';
    case JEUNE = 'youth';
    case PARENT = 'parent_or_guardian';
    case ENSEIGNANT = 'teacher';
    case TRAVAILLEUR_SOCIAL = 'social_worker';
    case PSYCHOLOGUE = 'psychologist';
    case AUTORITE_LOCALE = 'local_authority';
    case PARTENAIRE = 'partner';
    case AUTRE = 'other';

    public function label(): string
    {
        return __('types.' . $this->value);
    }
}