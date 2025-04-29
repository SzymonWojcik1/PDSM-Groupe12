<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Partenaire extends Model
{
    use HasFactory;
    
    protected $table = 'partenaires';
    protected $primaryKey = 'part_id';
    protected $fillable = ['part_id', 'part_nom', 'part_pays', 'part_region'];

    public function users()
    {
        return $this->hasMany(User::class, 'partenaire_id', 'part_id');
    }

    public function partenaire()
    {
        return $this->belongsTo(Partenaire::class, 'partenaire_id', 'part_id');
    }


}
