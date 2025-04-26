<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CadreLogique extends Model
{
    use HasFactory;

    protected $table = 'cadre_logique';
    protected $primaryKey = 'cad_id';

    protected $fillable = [
        'cad_nom',
        'cad_dateDebut',
        'cad_dateFin',
    ];
}