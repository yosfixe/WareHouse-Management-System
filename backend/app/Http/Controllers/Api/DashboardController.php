<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Warehouse;
use App\Models\Location;
use App\Models\Stock;
use App\Models\User;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        // Get low stock products
        $lowStockProducts = Product::with('stocks')
            ->get()
            ->filter(function ($product) {
                $totalStock = $product->stocks->sum('quantity');
                return $totalStock < $product->minimum_level;
            })
            ->count();

        // Get expiring stock (within 30 days)
        $expiringStock = 0;

        // Get recent stock movements (last 10)
        $recentMovements = StockMovement::with(['stock.product', 'stock.location', 'user'])
            ->orderBy('timestamp', 'desc')
            ->limit(10)
            ->get();

        // Calculate total warehouse utilization
        $warehouses = Warehouse::all();
        $totalCapacity = $warehouses->sum('capacity');
        $totalUsed = $warehouses->sum('current_size');
        $utilizationPercentage = $totalCapacity > 0 
            ? round(($totalUsed / $totalCapacity) * 100, 2) 
            : 0;

        return response()->json([
            'counts' => [
                'products' => Product::count(),
                'warehouses' => Warehouse::count(),
                'locations' => Location::count(),
                'stocks' => Stock::count(),
                'users' => User::count(),
            ],
            'alerts' => [
                'low_stock_products' => $lowStockProducts,
                'expiring_stock' => $expiringStock,
            ],
            'warehouse_utilization' => [
                'total_capacity' => $totalCapacity,
                'total_used' => $totalUsed,
                'utilization_percentage' => $utilizationPercentage,
            ],
            'warehouses' => $warehouses,
            'recent_movements' => $recentMovements,
        ]);
    }
}