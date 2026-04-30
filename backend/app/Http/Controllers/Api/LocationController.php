<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    /**
     * Display a listing of locations based on user role
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $role = $user->role;

        // Admin and Viewer: see all locations
        if ($role->name === 'Admin' || $role->name === 'Viewer') {
            $locations = Location::with('warehouse')->get();
        }
        // Operator: see only locations in their warehouse
        elseif (str_starts_with($role->name, 'Operator-')) {
            $locations = Location::with('warehouse')
                ->where('warehouse_id', $role->warehouse_id)
                ->get();
        }
        else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($locations);
    }

    /**
     * Store a newly created location
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $role = $user->role;

        // Viewer cannot create
        if ($role->name === 'Viewer') {
            return response()->json(['message' => 'Viewers cannot create locations'], 403);
        }

        $validated = $request->validate([
            'warehouse_id' => 'required|exists:warehouses,id',
            'code' => 'required|string|max:255|unique:locations,code',
            'description' => 'nullable|string',
        ]);

        // Operator: can only create locations in their warehouse
        if (str_starts_with($role->name, 'Operator-' && $validated['warehouse_id'] != $role->warehouse_id)) {
            return response()->json(['message' => 'You can only create locations in your assigned warehouse'], 403);
        }

        $location = Location::create($validated);
        $location->load('warehouse');

        return response()->json([
            'message' => 'Location created successfully',
            'location' => $location
        ], 201);
    }

    /**
     * Display the specified location
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $role = $user->role;

        $location = Location::with('warehouse')->find($id);

        if (!$location) {
            return response()->json(['message' => 'Location not found'], 404);
        }

        // Operator: can only view locations in their warehouse
        if (str_starts_with($role->name, 'Operator-' && $location->warehouse_id != $role->warehouse_id)) {
            return response()->json(['message' => 'You can only view locations in your assigned warehouse'], 403);
        }

        return response()->json($location);
    }

    /**
     * Update the specified location
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $role = $user->role;

        // Viewer cannot update
        if ($role->name === 'Viewer') {
            return response()->json(['message' => 'Viewers cannot modify locations'], 403);
        }

        $location = Location::find($id);

        if (!$location) {
            return response()->json(['message' => 'Location not found'], 404);
        }

        // Operator: can only update locations in their warehouse
        if (str_starts_with($role->name, 'Operator-' && $location->warehouse_id != $role->warehouse_id)) {
            return response()->json(['message' => 'You can only update locations in your assigned warehouse'], 403);
        }

        $validated = $request->validate([
            'warehouse_id' => 'sometimes|required|exists:warehouses,id',
            'code' => 'sometimes|required|string|max:255|unique:locations,code,' . $id,
            'description' => 'sometimes|nullable|string',
        ]);

        // If changing warehouse, verify it's still operator's warehouse
        if (isset($validated['warehouse_id']) && $role->name === 'Operator') {
            if ($validated['warehouse_id'] != $role->warehouse_id) {
                return response()->json(['message' => 'You cannot move locations to another warehouse'], 403);
            }
        }

        $location->update($validated);
        $location->load('warehouse');

        return response()->json([
            'message' => 'Location updated successfully',
            'location' => $location
        ]);
    }

    /**
     * Remove the specified location
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $role = $user->role;

        // Viewer cannot delete
        if ($role->name === 'Viewer') {
            return response()->json(['message' => 'Viewers cannot delete locations'], 403);
        }

        $location = Location::find($id);

        if (!$location) {
            return response()->json(['message' => 'Location not found'], 404);
        }

        // Operator: can only delete locations in their warehouse
        if (str_starts_with($role->name, 'Operator-' && $location->warehouse_id != $role->warehouse_id)) {
            return response()->json(['message' => 'You can only delete locations in your assigned warehouse'], 403);
        }

        $location->delete();

        return response()->json(['message' => 'Location deleted successfully']);
    }
}