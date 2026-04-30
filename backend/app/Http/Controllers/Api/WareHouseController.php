<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WareHouse;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WarehouseController extends Controller
{
    /**
     * Display a listing of warehouses based on user role
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $role = $user->role;

        if ($role->name === 'Admin' || $role->name === 'Viewer') {
            $warehouses = WareHouse::all();
        } elseif (str_starts_with($role->name, 'Operator-')) {
            $warehouses = WareHouse::where('id', $role->warehouse_id)->get();
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($warehouses);
    }

    /**
     * Store a newly created warehouse
     * Only Admin can create warehouses
     * Auto-creates an Operator role for the new warehouse (no user assigned yet)
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->role->name !== 'Admin') {
            return response()->json(['message' => 'Only Admins can create warehouses'], 403);
        }

        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'address'      => 'required|string',
            'capacity'     => 'required|string',
            'current_size' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            $warehouse = WareHouse::create([
                'name'         => $validated['name'],
                'address'      => $validated['address'],
                'capacity'     => $validated['capacity'],
                'current_size' => $validated['current_size'] ?? '0',
            ]);

            // Auto-create Operator role for this warehouse (user assigned later)
            Role::create([
                'name'         => 'Operator-' . $warehouse->name,
                'privileges'   => 'Manage ' . $warehouse->name . ' stocks and locations',
                'warehouse_id' => $warehouse->id,
            ]);

            DB::commit();

            return response()->json([
                'message'   => 'Warehouse created successfully',
                'warehouse' => $warehouse
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create warehouse',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified warehouse
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $role = $user->role;

        $warehouse = WareHouse::find($id);

        if (!$warehouse) {
            return response()->json(['message' => 'Warehouse not found'], 404);
        }

        if (str_starts_with($role->name, 'Operator-') && $role->warehouse_id != $id) {
            return response()->json(['message' => 'You can only view your assigned warehouse'], 403);
        }

        return response()->json($warehouse);
    }

    /**
     * Update the specified warehouse
     * Operators can only update their own warehouse
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $role = $user->role;

        if ($role->name === 'Viewer') {
            return response()->json(['message' => 'Viewers cannot modify warehouses'], 403);
        }

        $warehouse = WareHouse::find($id);

        if (!$warehouse) {
            return response()->json(['message' => 'Warehouse not found'], 404);
        }

        if (str_starts_with($role->name, 'Operator-') && $role->warehouse_id != $id) {
            return response()->json(['message' => 'You can only update your assigned warehouse'], 403);
        }

        $validated = $request->validate([
            'name'         => 'sometimes|required|string|max:255',
            'address'      => 'sometimes|required|string',
            'capacity'     => 'sometimes|required|string',
            'current_size' => 'sometimes|nullable|string',
        ]);

        $warehouse->update($validated);

        return response()->json([
            'message'   => 'Warehouse updated successfully',
            'warehouse' => $warehouse
        ]);
    }

    /**
     * Remove the specified warehouse
     * Only Admin can delete warehouses
     * Auto-deletes associated Operator role and any users assigned to it
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role->name !== 'Admin') {
            return response()->json(['message' => 'Only Admins can delete warehouses'], 403);
        }

        $warehouse = WareHouse::find($id);

        if (!$warehouse) {
            return response()->json(['message' => 'Warehouse not found'], 404);
        }

        DB::beginTransaction();

        try {
            $operatorRole = Role::where('warehouse_id', $id)
                               ->where('name', 'LIKE', 'Operator-%')
                               ->first();

            if ($operatorRole) {
                // Unassign or delete users tied to this operator role
                User::where('role_id', $operatorRole->id)->delete();
                $operatorRole->delete();
            }

            $warehouse->delete();

            DB::commit();

            return response()->json([
                'message' => 'Warehouse, associated Operator role, and users deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete warehouse',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assign the Operator role of this warehouse to an existing user
     * Only Admin can assign roles
     * Overwrites any existing role the user has
     */
    public function assignRole(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role->name !== 'Admin') {
            return response()->json(['message' => 'Only Admins can assign roles'], 403);
        }

        $warehouse = WareHouse::find($id);

        if (!$warehouse) {
            return response()->json(['message' => 'Warehouse not found'], 404);
        }

        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
        ]);

        $operatorRole = Role::where('warehouse_id', $id)
                           ->where('name', 'LIKE', 'Operator-%')
                           ->first();

        if (!$operatorRole) {
            return response()->json(['message' => 'Operator role for this warehouse not found'], 404);
        }

        $targetUser = User::find($validated['user_id']);
        $targetUser->role_id = $operatorRole->id;
        $targetUser->save();

        return response()->json([
            'message' => 'Role assigned successfully',
            'user'    => $targetUser->only(['id', 'name', 'email']),
            'role'    => $operatorRole->name,
        ]);
    }

    /**
     * Get locations for a specific warehouse
     */
    public function getLocations(Request $request, $id)
    {
        $user = $request->user();
        $role = $user->role;

        if (str_starts_with($role->name, 'Operator-') && $role->warehouse_id != $id) {
            return response()->json(['message' => 'You can only view locations in your assigned warehouse'], 403);
        }

        $warehouse = WareHouse::with('locations')->find($id);

        if (!$warehouse) {
            return response()->json(['message' => 'Warehouse not found'], 404);
        }

        return response()->json($warehouse->locations);
    }

    /**
     * Get stock summary for a specific warehouse
     */
    public function getStockSummary(Request $request, $id)
    {
        $user = $request->user();
        $role = $user->role;

        if (str_starts_with($role->name, 'Operator-') && $role->warehouse_id != $id) {
            return response()->json(['message' => 'You can only view stock in your assigned warehouse'], 403);
        }

        $warehouse = WareHouse::with(['locations.stocks.product'])->find($id);

        if (!$warehouse) {
            return response()->json(['message' => 'Warehouse not found'], 404);
        }

        $stockSummary = [];

        foreach ($warehouse->locations as $location) {
            foreach ($location->stocks as $stock) {
                $productName = $stock->product->name ?? 'Unknown';

                if (!isset($stockSummary[$productName])) {
                    $stockSummary[$productName] = 0;
                }

                $stockSummary[$productName] += $stock->quantity;
            }
        }

        return response()->json([
            'warehouse_id'   => $warehouse->id,
            'warehouse_name' => $warehouse->name,
            'stock_summary'  => $stockSummary
        ]);
    }
}