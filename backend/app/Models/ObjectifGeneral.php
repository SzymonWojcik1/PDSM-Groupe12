<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ObjectifGeneral extends Model
{
    protected $table = 'objectif_general';
    protected $primaryKey = 'obj_id';

    protected $fillable = ['obj_nom', 'cad_id'];

    public function cadreLogique()
    {
        return $this->belongsTo(CadreLogique::class, 'cad_id', 'cad_id');
    }

    public function outcomes()
    {
        return $this->hasMany(Outcome::class, 'obj_id', 'obj_id');
    }
}
