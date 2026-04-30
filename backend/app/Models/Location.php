<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    protected $table = 'locations';
    
    protected $fillable = [
        'warehouse_id',
        'code',
        'description'
    ];

    // Define inverse relationship
    public function warehouse()
    {
        return $this->belongsTo(WareHouse::class, 'warehouse_id', 'id');
    }
}