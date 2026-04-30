<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    protected $table = 'stock_movements';
    public $timestamps = false;

    protected $fillable = [
        'stock_id',
        'user_id',
        'movement_type',
        'from_location_id',
        'to_location_id',
        'reason',
        'quantity',
        'timestamp',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
    ];

    public function stock()
    {
        return $this->belongsTo(Stock::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function from_location()
    {
        return $this->belongsTo(Location::class, 'from_location_id');
    }

    public function to_location()
    {
        return $this->belongsTo(Location::class, 'to_location_id');
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}