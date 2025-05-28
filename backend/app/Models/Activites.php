<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Activites extends Model
{
    use HasFactory;

    // Define the associated table and primary key
    protected $table = 'activites';
    protected $primaryKey = 'act_id';

    // Mass assignable attributes
    protected $fillable = ['act_nom', 'act_dateDebut', 'act_dateFin', 'act_part_id', 'act_pro_id'];

    // Relationship: Activity belongs to a partner
    public function partenaire()
    {
        return $this->belongsTo(Partenaire::class, 'act_part_id', 'part_id');
    }

    // Relationship: Activity belongs to a project
    public function projet()
    {
        return $this->belongsTo(Projet::class, 'act_pro_id', 'pro_id');
    }

    // Relationship: Activity has many beneficiaries (many-to-many)
    public function beneficiaires()
    {
        return $this->belongsToMany(Beneficiaire::class, 'activite_beneficiaire', 'acb_act_id', 'acb_ben_id');
    }
}
