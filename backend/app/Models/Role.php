<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable = [
        'name',
        'privileges',
        'warehouse_id',
    ];

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}