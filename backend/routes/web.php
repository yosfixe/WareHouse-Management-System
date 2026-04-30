<?php

use Illuminate\Support\Facades\Route;


Route::get('/', function () {
    return response()->json([
        'message' => 'WMS API',
        'version' => '1.0',
        'endpoints' => '/api/*'
    ]);
});