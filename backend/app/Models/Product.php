<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'sku',
        'description',
        'unit',
        'minimum_level',
        'expiry_required',
    ];
    
    protected $table = "products";

    public function stocks()
    {
        return $this->hasMany(Stock::class);
    }
}
