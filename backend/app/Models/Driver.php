<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'truck_id',
    ];

    public function truck()
    {
        return $this->belongsTo(Truck::class);
    }

    public function movements()
    {
        return $this->hasMany(StockMovement::class);
    }

    // Computed status based on whether a truck is assigned
    public function getStatusAttribute(): string
    {
        return $this->truck_id ? 'On Duty' : 'Standby';
    }

    protected $appends = ['status'];
}