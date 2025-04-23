<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\Type;
use App\Enums\Zone;
use App\Enums\Sexe;
use App\Enums\Genre;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Beneficiaire extends Model
{
    use HasFactory;

    protected $table = 'beneficiaires';

    protected $primaryKey = 'ben_id';

    public $incrementing = true;

    protected $casts = [
        'ben_zone' => Zone::class,
        'ben_type' => Type::class,
        'ben_sexe' => Sexe::class,
        'ben_genre' => Genre::class,
    ];

    protected $fillable = [
        'ben_prenom',
        'ben_nom',
        'ben_date_naissance',
        'ben_region',
        'ben_pays',
        'ben_type',
        'ben_type_autre',
        'ben_zone',
        'ben_sexe',
        'ben_sexe_autre',
        'ben_genre',
        'ben_genre_autre',
        'ben_ethnicite',
    ];

    public function getRouteKeyName()
    {
        return 'ben_id';
    }
}