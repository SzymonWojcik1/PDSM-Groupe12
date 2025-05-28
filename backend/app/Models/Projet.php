<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Projet extends Model
{
    use HasFactory;

    // Define the associated table and primary key
    protected $table = 'projet';
    protected $primaryKey = 'pro_id';

    // Mass assignable attributes
    protected $fillable = ['pro_nom', 'pro_dateDebut', 'pro_dateFin', 'pro_part_id'];

    // Relationship: Project belongs to a partner
    public function partenaire()
    {
        return $this->belongsTo(Partenaire::class, 'pro_part_id', 'part_id');
    }
}
