<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\ObjectifGeneral;
use App\Models\Output;
use App\Models\Indicateur;
use App\Models\CadreLogique;

class Output extends Model
{
    use HasFactory;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    
    protected $table = 'output';
    protected $primaryKey = 'opu_id';

    protected $fillable = ['opu_nom', 'opu_code', 'out_id'];

    public function outcome()
    {
        return $this->belongsTo(Outcome::class, 'out_id', 'out_id');
    }

    public function indicateurs()
    {
        return $this->hasMany(Indicateur::class, 'opu_id', 'opu_id');
    }
}
