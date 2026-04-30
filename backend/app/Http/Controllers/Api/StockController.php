<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use App\Models\Location;
use App\Models\StockMovement;
use Illuminate\Http\Request;

class StockController extends Controller
{
    /**
     * List all stocks
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $role = $user->role;

        if ($role->name === 'Admin' || $role->name === 'Viewer') {
            $stocks = Stock::with(['product', 'location.warehouse'])->get();
        } elseif (str_starts_with($role->name, 'Operator-')) {
            $stocks = Stock::with(['product', 'location.warehouse'])
                ->whereHas('location', function ($query) use ($role) {
                    $query->where('warehouse_id', $role->warehouse_id);
                })
                ->get();
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($stocks);
    }

    /**
     * List all stock movements — GET /stocks/movements
     */
    public function movements(Request $request)
    {
        $user = $request->user();
        $role = $user->role;

        if ($role->name === 'Admin' || $role->name === 'Viewer') {
            $movements = StockMovement::with([
                'stock.product',
                'stock.location.warehouse',
                'user',
                'from_location.warehouse',
                'to_location.warehouse',
                'driver.truck',
            ])->orderBy('timestamp', 'desc')->get();
        } elseif (str_starts_with($role->name, 'Operator-')) {
            $movements = StockMovement::with([
                'stock.product',
                'stock.location.warehouse',
                'user',
                'fromLocation.warehouse',
                'toLocation.warehouse',
            ])
            ->whereHas('stock.location', function ($query) use ($role) {
                $query->where('warehouse_id', $role->warehouse_id);
            })
            ->orderBy('timestamp', 'desc')
            ->get();
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($movements);
    }

    /**
     * Delete a movement — Admin only — DELETE /stocks/movements/{id}
     */
    public function deleteMovement(Request $request, $id)
    {
        if ($request->user()->role->name !== 'Admin') {
            return response()->json(['message' => 'Only Admins can delete movements'], 403);
        }

        $movement = StockMovement::find($id);

        if (!$movement) {
            return response()->json(['message' => 'Movement not found'], 404);
        }

        $movement->delete();

        return response()->json(['message' => 'Movement deleted successfully']);
    }

    /**
     * Manually create a movement — POST /stocks/movements
     */
    public function storeMovement(Request $request)
    {
        $user = $request->user();

        if ($user->role->name === 'Viewer') {
            return response()->json(['message' => 'Viewers cannot create movements'], 403);
        }

        $validated = $request->validate([
            'stock_id'         => 'required|exists:stocks,id',
            'movement_type'    => 'required|in:IN,OUT,TRANSFER,ADJUSTMENT',
            'from_location_id' => 'nullable|exists:locations,id',
            'to_location_id'   => 'nullable|exists:locations,id',
            'reason'           => 'nullable|string|max:255',
            'quantity'         => 'required|integer|min:1',
        ]);

        $movement = StockMovement::create([
            ...$validated,
            'user_id'   => $user->id,
            'timestamp' => now(),
        ]);

        $movement->load([
            'stock.product',
            'stock.location.warehouse',
            'user',
            'from_location.warehouse',
            'to_location.warehouse',
            'driver.truck',
        ]);

        return response()->json([
            'message'  => 'Movement created successfully',
            'movement' => $movement
        ], 201);
    }

    /**
     * Create a stock entry — auto-generates IN movement
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $role = $user->role;

        if ($role->name === 'Viewer') {
            return response()->json(['message' => 'Viewers cannot create stocks'], 403);
        }

        $validated = $request->validate([
            'product_id'  => 'required|exists:products,id',
            'location_id' => 'required|exists:locations,id',
            'quantity'    => 'required|integer|min:0',
        ]);

        $location = Location::find($validated['location_id']);

        if (str_starts_with($role->name, 'Operator-') && $location->warehouse_id != $role->warehouse_id) {
            return response()->json(['message' => 'You can only create stocks in your assigned warehouse'], 403);
        }

        $stock = Stock::create($validated);
        $stock->load(['product', 'location.warehouse']);

        StockMovement::create([
            'stock_id'       => $stock->id,
            'user_id'        => $user->id,
            'movement_type'  => 'IN',
            'to_location_id' => $stock->location_id,
            'quantity'       => $stock->quantity,
            'reason'         => 'Stock created',
            'timestamp'      => now(),
        ]);

        return response()->json([
            'message' => 'Stock created successfully',
            'stock'   => $stock
        ], 201);
    }

    /**
     * Show a single stock
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $role = $user->role;

        $stock = Stock::with(['product', 'location.warehouse'])->find($id);

        if (!$stock) {
            return response()->json(['message' => 'Stock not found'], 404);
        }

        if (str_starts_with($role->name, 'Operator-') && $stock->location->warehouse_id != $role->warehouse_id) {
            return response()->json(['message' => 'You can only view stocks in your assigned warehouse'], 403);
        }

        return response()->json($stock);
    }

    /**
     * Update a stock — auto-generates TRANSFER or ADJUSTMENT movement
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $role = $user->role;

        if ($role->name === 'Viewer') {
            return response()->json(['message' => 'Viewers cannot modify stocks'], 403);
        }

        $stock = Stock::with('location')->find($id);

        if (!$stock) {
            return response()->json(['message' => 'Stock not found'], 404);
        }

        if (str_starts_with($role->name, 'Operator-') && $stock->location->warehouse_id != $role->warehouse_id) {
            return response()->json(['message' => 'You can only update stocks in your assigned warehouse'], 403);
        }

        $validated = $request->validate([
            'product_id'  => 'sometimes|required|exists:products,id',
            'location_id' => 'sometimes|required|exists:locations,id',
            'quantity'    => 'sometimes|required|integer|min:0',
        ]);

        $oldQuantity   = $stock->quantity;
        $oldLocationId = $stock->location_id;

        if (isset($validated['location_id']) && $validated['location_id'] != $oldLocationId) {
            $newLocation = Location::find($validated['location_id']);

            if (str_starts_with($role->name, 'Operator-') && $newLocation->warehouse_id != $role->warehouse_id) {
                return response()->json(['message' => 'You can only move stocks within your assigned warehouse'], 403);
            }

            StockMovement::create([
                'stock_id'         => $stock->id,
                'user_id'          => $user->id,
                'movement_type'    => 'TRANSFER',
                'from_location_id' => $oldLocationId,
                'to_location_id'   => $validated['location_id'],
                'quantity'         => $validated['quantity'] ?? $oldQuantity,
                'reason'           => 'Location transfer',
                'timestamp'        => now(),
            ]);
        } elseif (isset($validated['quantity']) && $validated['quantity'] != $oldQuantity) {
            $diff = $validated['quantity'] - $oldQuantity;

            StockMovement::create([
                'stock_id'       => $stock->id,
                'user_id'        => $user->id,
                'movement_type'  => 'ADJUSTMENT',
                'to_location_id' => $stock->location_id,
                'quantity'       => abs($diff),
                'reason'         => $diff > 0 ? 'Quantity increased' : 'Quantity decreased',
                'timestamp'      => now(),
            ]);
        }

        $stock->update($validated);
        $stock->load(['product', 'location.warehouse']);

        return response()->json([
            'message' => 'Stock updated successfully',
            'stock'   => $stock
        ]);
    }

    /**
     * Delete a stock — auto-generates OUT movement
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $role = $user->role;

        if ($role->name === 'Viewer') {
            return response()->json(['message' => 'Viewers cannot delete stocks'], 403);
        }

        $stock = Stock::with('location')->find($id);

        if (!$stock) {
            return response()->json(['message' => 'Stock not found'], 404);
        }

        if (str_starts_with($role->name, 'Operator-') && $stock->location->warehouse_id != $role->warehouse_id) {
            return response()->json(['message' => 'You can only delete stocks in your assigned warehouse'], 403);
        }

        StockMovement::create([
            'stock_id'         => $stock->id,
            'user_id'          => $user->id,
            'movement_type'    => 'OUT',
            'from_location_id' => $stock->location_id,
            'quantity'         => $stock->quantity,
            'reason'           => 'Stock removed',
            'timestamp'        => now(),
        ]);

        $stock->delete();

        return response()->json(['message' => 'Stock deleted successfully']);
    }
}