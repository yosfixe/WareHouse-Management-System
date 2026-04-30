<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\WarehouseController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\StockController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\TruckController;


// Public routes (no authentication)
Route::post('login', [AuthController::class, 'login']);

// Protected routes (require authentication with Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('user', [AuthController::class, 'user']);

    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index']);

    // Products
    Route::apiResource('products', ProductController::class);
    Route::get('products-low-stock', [ProductController::class, 'lowStock']);

    // Warehouses
    Route::apiResource('warehouses', WarehouseController::class);
    Route::get('warehouses/{id}/locations', [WarehouseController::class, 'locations']);
    Route::get('warehouses/{id}/stock-summary', [WarehouseController::class, 'stockSummary']);
    Route::post('/warehouses/{id}/assign-role', [WarehouseController::class, 'assignRole']);

    // Locations
    Route::apiResource('locations', LocationController::class);
    Route::get('locations/{id}/stocks', [LocationController::class, 'stocks']);

    // Stocks — movements
    Route::get('stocks/movements', [StockController::class, 'movements']);
    Route::post('stocks/movements', [StockController::class, 'storeMovement']);
    Route::delete('stocks/movements/{id}', [StockController::class, 'deleteMovement']);
    Route::apiResource('stocks', StockController::class);

    Route::post('stocks/transfer', [StockController::class, 'transfer']);
    Route::get('stocks-expiring', [StockController::class, 'expiringStock']);

    // Users
    Route::apiResource('users', UserController::class);
    
    // Roles (managed through UserController)
    Route::get('roles', [UserController::class, 'getRoles']);
    Route::post('roles', [UserController::class, 'createRole']);
    Route::put('roles/{roleId}', [UserController::class, 'updateRole']);
    Route::delete('roles/{roleId}', [UserController::class, 'deleteRole']);

    // Truck and Drivers
    Route::apiResource('trucks', TruckController::class);
    Route::apiResource('drivers', DriverController::class);
});