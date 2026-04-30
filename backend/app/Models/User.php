<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, HasApiTokens;

    protected $fillable = [
        'username',
        'password',
        'fullname',
        'role_id',
    ];

    protected $hidden = [
        'password',
    ];

    /**
     * Get the role that owns the user
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get the stock movements for the user
     */
    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }
}