<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Evaluation extends Model
{
    use HasFactory;

    protected $primaryKey = 'eva_id';

    protected $fillable = [
        'eva_use_id',
        'eva_statut',
        'eva_date_soumission',
        'criteres',
    ];

    protected $casts = [
        'criteres' => 'array',
    ];

    public function utilisateur()
    {
        return $this->belongsTo(User::class, 'eva_use_id');
    }
}
