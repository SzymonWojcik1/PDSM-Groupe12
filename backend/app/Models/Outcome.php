<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\ObjectifGeneral;
use App\Models\Output;
use App\Models\Indicateur;

class Outcome extends Model
{
    use HasFactory;

    protected $table = 'outcome';
    protected $primaryKey = 'out_id';

    protected $fillable = ['out_nom', 'out_code', 'obj_id'];

    public function objectifGeneral()
    {
        return $this->belongsTo(ObjectifGeneral::class, 'obj_id', 'obj_id');
    }

    public function outputs()
    {
        return $this->hasMany(Output::class, 'out_id', 'out_id');
    }

    public function indicateurs()
    {
        return $this->hasMany(Indicateur::class, 'out_id', 'out_id');
    }
}
