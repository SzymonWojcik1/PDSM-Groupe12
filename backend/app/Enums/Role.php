<?php

namespace App\Enums;

enum Role: string
{
    case UTILISATEUR = 'utilisateur';
    case CN = 'cn';
    case CR = 'cr';
    case SIEGE = 'siege';

    public static function hierarchy(): array
    {
        return [
            self::UTILISATEUR->value,
            self::CN->value,
            self::CR->value,
            self::SIEGE->value,
        ];
    }

    public static function isSuperior(string $superior, string $subordinate): bool
    {
        $hierarchy = self::hierarchy();
        $superiorIndex = array_search($superior, $hierarchy);
        $subordinateIndex = array_search($subordinate, $hierarchy);

        return $superiorIndex !== false && $subordinateIndex !== false && $superiorIndex > $subordinateIndex;
    }
}
