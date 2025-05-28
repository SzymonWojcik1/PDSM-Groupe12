<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
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
