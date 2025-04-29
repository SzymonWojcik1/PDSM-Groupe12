<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Indicateur extends Model
{
    protected $table = 'indicateur';
    protected $primaryKey = 'ind_id';

    protected $fillable = [
        'ind_type', 'ind_reference', 'ind_nom', 'ind_valeurCible2028',
        'out_id', 'opu_id'
    ];

    public function outcome()
    {
        return $this->belongsTo(Outcome::class, 'out_id', 'out_id');
    }

    public function output()
    {
        return $this->belongsTo(Output::class, 'opu_id', 'opu_id');
    }
}
