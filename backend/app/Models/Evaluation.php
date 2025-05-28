<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Evaluation extends Model
{
    use HasFactory;

    // Define the primary key
    protected $primaryKey = 'eva_id';

    // Mass assignable attributes
    protected $fillable = [
        'eva_use_id',
        'eva_statut',
        'eva_date_soumission',
        'criteres',
    ];

    // Automatically cast 'criteres' as array when accessed or stored
    protected $casts = [
        'criteres' => 'array',
    ];

    // Relationship: Evaluation belongs to a user
    public function utilisateur()
    {
        return $this->belongsTo(User::class, 'eva_use_id', 'id');
    }
}
