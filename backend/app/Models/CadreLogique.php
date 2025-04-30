<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\ObjectifGeneral;

class CadreLogique extends Model
{
    use HasFactory;

    protected $table = 'cadre_logique';
    protected $primaryKey = 'cad_id';

    protected $fillable = ['cad_nom', 'cad_dateDebut', 'cad_dateFin'];

    public function objectifsGeneraux()
    {
        return $this->hasMany(ObjectifGeneral::class, 'cad_id', 'cad_id');
    }
}