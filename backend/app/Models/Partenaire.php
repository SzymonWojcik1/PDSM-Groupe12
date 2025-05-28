<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Partenaire extends Model
{
    use HasFactory;

    // Define the associated table and primary key
    protected $table = 'partenaires';
    protected $primaryKey = 'part_id';

    // Mass assignable attributes
    protected $fillable = ['part_id', 'part_nom', 'part_pays', 'part_region'];

    // Relationship: A partner has many users
    public function users()
    {
        return $this->hasMany(User::class, 'partenaire_id', 'part_id');
    }

    // Self-referencing relationship (if applicable)
    public function partenaire()
    {
        return $this->belongsTo(Partenaire::class, 'partenaire_id', 'part_id');
    }
}
