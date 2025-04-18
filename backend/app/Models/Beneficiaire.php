<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\Type;
use App\Enums\Zone;
use App\Enums\Sexe;
use App\Enums\Genre;


class Beneficiaire extends Model
{
    protected $casts = [
        'zone' => Zone::class,
        'type' => Type::class,
        'sexe' => Sexe::class,
        'genre' => Genre::class,
    ];
    protected $fillable = [
        'prenom',
        'nom',
        'date_naissance',
        'region',
        'pays',
        'type',
        'type_autre',
        'zone',
        'sexe',
        'sexe_autre',
        'genre',
        'genre_autre',
        'ethnicite',
    ];

}
