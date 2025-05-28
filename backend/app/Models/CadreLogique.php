<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\ObjectifGeneral;

class CadreLogique extends Model
{
    use HasFactory;

    // Define the associated table and primary key
    protected $table = 'cadre_logique';
    protected $primaryKey = 'cad_id';

    // Mass assignable attributes
    protected $fillable = ['cad_nom', 'cad_dateDebut', 'cad_dateFin'];

    // Relationship: One logic framework has many general objectives
    public function objectifsGeneraux()
    {
        return $this->hasMany(ObjectifGeneral::class, 'cad_id', 'cad_id');
    }
}
