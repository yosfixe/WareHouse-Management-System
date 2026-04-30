<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WareHouse extends Model
{
    protected $table = 'warehouses';
    
    protected $fillable = [
        'name',
        'address',
        'capacity',
        'current_size'
    ];

    // Define relationship with correct foreign key
    public function locations()
    {
        return $this->hasMany(Location::class, 'warehouse_id', 'id');
    }

    // Handle cascading deletes
    protected static function boot()
    {
        parent::boot();

        static::deleting(function($warehouse) {
            // Delete all related locations when warehouse is deleted
            $warehouse->locations()->delete();
        });
    }
}