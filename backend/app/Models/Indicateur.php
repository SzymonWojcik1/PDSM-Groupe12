<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Indicateur extends Model
{
    use HasFactory;
    
    protected $table = 'indicateur';
    protected $primaryKey = 'ind_id';

    protected $fillable = [
        'ind_code', 'ind_nom', 'ind_valeurCible',
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

    public function activites()
    {
        return $this->belongsToMany(
            \App\Models\Activites::class,
            'activite_indicateur',
            'ind_id',
            'act_id',
            'ind_id',
            'act_id'
        );
    }


}
