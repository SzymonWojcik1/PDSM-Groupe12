<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Activites extends Model
{
    use HasFactory;

    protected $table = 'activites';
    protected $primaryKey = 'act_id';

    protected $fillable = ['act_nom','act_dateDebut','act_dateFin','act_part_id','act_pro_id'];

    public function partenaire()
    {
        return $this->belongsTo(Partenaire::class, 'act_part_id', 'part_id');
    }

    public function projet()
    {
        return $this->belongsTo(Projet::class, 'act_pro_id', 'pro_id');
    }

    public function beneficiaires()
    {
        return $this->belongsToMany(Beneficiaire::class, 'activite_beneficiaire', 'acb_act_id', 'acb_ben_id');
    }


}
