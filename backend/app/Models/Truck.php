<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Truck extends Model
{
    protected $fillable = [
        'plate',
        'model',
        'capacity',
    ];

    public function driver()
    {
        return $this->hasOne(Driver::class);
    }

    // Computed status based on whether a driver is assigned
    public function getStatusAttribute(): string
    {
        return $this->driver ? 'In Use' : 'Standby';
    }

    protected $appends = ['status'];
}