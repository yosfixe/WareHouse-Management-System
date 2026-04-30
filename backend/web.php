<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\WarehouseController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;

Route::get('/', function () {
    return view('welcome');
});

// Dashboard
Route::get("/home", [DashboardController::class, "index"])->name("home");


// PRODUCTS
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
Route::post('/products/store', [ProductController::class, 'store'])->name('products.store');
Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
Route::post('/products/{product}/update', [ProductController::class, 'update'])->name('products.update');
Route::post('/products/{product}/destroy', [ProductController::class, 'destroy'])->name('products.destroy');

// WAREHOUSES
Route::get('/warehouses', [WarehouseController::class, 'index'])->name('warehouses.index');
Route::get('/warehouses/create', [WarehouseController::class, 'create'])->name('warehouses.create');
Route::post('/warehouses/store', [WarehouseController::class, 'store'])->name('warehouses.store');
Route::get('/warehouses/{warehouse}/edit', [WarehouseController::class, 'edit'])->name('warehouses.edit');
Route::post('/warehouses/{warehouse}/update', [WarehouseController::class, 'update'])->name('warehouses.update');
Route::post('/warehouses/{warehouse}/destroy', [WarehouseController::class, 'destroy'])->name('warehouses.destroy');

// LOCATIONS
Route::get('/locations', [LocationController::class, 'index'])->name('locations.index');
Route::get('/locations/create', [LocationController::class, 'create'])->name('locations.create');
Route::post('/locations/store', [LocationController::class, 'store'])->name('locations.store');
Route::get('/locations/{location}/edit', [LocationController::class, 'edit'])->name('locations.edit');
Route::post('/locations/{location}/update', [LocationController::class, 'update'])->name('locations.update');
Route::post('/locations/{location}/destroy', [LocationController::class, 'destroy'])->name('locations.destroy');

// STOCK
Route::get('/stock', [StockController::class, 'index'])->name('stocks.index');
Route::get('/stock/create', [StockController::class, 'create'])->name('stocks.create');
Route::post('/stock/store', [StockController::class, 'store'])->name('stocks.store');
Route::get('/stock/{stock}/edit', [StockController::class, 'edit'])->name('stocks.edit');
Route::post('/stock/{stock}/update', [StockController::class, 'update'])->name('stocks.update');
Route::post('/stock/{stock}/destroy', [StockController::class, 'destroy'])->name('stocks.destroy');
Route::get('/stocks/movements', [StockController::class, 'movements'])->name('stocks.movements');

// USERS
Route::get('/users', [UserController::class, 'index'])->name('users.index');
Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
Route::post('/users/store', [UserController::class, 'store'])->name('users.store');
Route::get('/users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
Route::post('/users/{user}/update', [UserController::class, 'update'])->name('users.update');
Route::post('/users/{user}/destroy', [UserController::class, 'destroy'])->name('users.destroy');
