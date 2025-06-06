<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Log extends Model
{
    use HasFactory;
    
    // Mass assignable attributes
    protected $fillable = [
        'user_id',
        'level',
        'action',
        'message',
        'context',
    ];

    // Relationship: Log entry belongs to a user
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }
}
