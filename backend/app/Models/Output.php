<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Output extends Model
{
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
