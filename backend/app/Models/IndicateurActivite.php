<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Activites;
use App\Models\Indicateur;

class IndicateurActivite extends Model
{
    use HasFactory;

    protected $table = 'activite_indicateur';
    protected $primaryKey = 'id';
    protected $fillable = ['act_id', 'ind_id'];

    public function activite()
    {
        return $this->belongsTo(Activites::class, 'act_id', 'act_id');
    }

    public function indicateur()
    {
        return $this->belongsTo(Indicateur::class, 'ind_id', 'ind_id');
    }

}
