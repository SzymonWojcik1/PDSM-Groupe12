<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActiviteBeneficiaire extends Model
{
    protected $table = 'activite_beneficiaire';
    protected $primaryKey = 'acb_id';

    protected $fillable = [
        'acb_act_id',
        'acb_ben_id'
    ];

    public function activite()
    {
        return $this->belongsTo(Activite::class, 'acb_act_id', 'act_id');
    }

    public function beneficiaire()
    {
        return $this->belongsTo(Beneficiaire::class, 'acb_ben_id', 'ben_id');
    }
} 