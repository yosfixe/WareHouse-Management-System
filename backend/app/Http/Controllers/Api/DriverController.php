<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    public function index()
    {
        $drivers = Driver::with('truck')->get();
        return response()->json($drivers);
    }

    public function store(Request $request)
    {
        if ($request->user()->role->name !== 'Admin') {
            return response()->json(['message' => 'Only Admins can manage drivers'], 403);
        }

        $validated = $request->validate([
            'name'     => 'required|string',
            'phone'    => 'required|string',
            'truck_id' => 'nullable|exists:trucks,id',
        ]);

        // If assigning a truck, unassign any existing driver on that truck
        if (!empty($validated['truck_id'])) {
            Driver::where('truck_id', $validated['truck_id'])->update(['truck_id' => null]);
        }

        $driver = Driver::create($validated);
        $driver->load('truck');

        return response()->json([
            'message' => 'Driver created successfully',
            'driver'  => $driver
        ], 201);
    }

    public function show($id)
    {
        $driver = Driver::with('truck')->find($id);

        if (!$driver) {
            return response()->json(['message' => 'Driver not found'], 404);
        }

        return response()->json($driver);
    }

    public function update(Request $request, $id)
    {
        if ($request->user()->role->name !== 'Admin') {
            return response()->json(['message' => 'Only Admins can manage drivers'], 403);
        }

        $driver = Driver::find($id);

        if (!$driver) {
            return response()->json(['message' => 'Driver not found'], 404);
        }

        $validated = $request->validate([
            'name'     => 'sometimes|required|string',
            'phone'    => 'sometimes|required|string',
            'truck_id' => 'nullable|exists:trucks,id',
        ]);

        // If assigning a new truck, unassign any existing driver on that truck
        if (array_key_exists('truck_id', $validated) && $validated['truck_id']) {
            Driver::where('truck_id', $validated['truck_id'])
                  ->where('id', '!=', $id)
                  ->update(['truck_id' => null]);
        }

        $driver->update($validated);
        $driver->load('truck');

        return response()->json([
            'message' => 'Driver updated successfully',
            'driver'  => $driver
        ]);
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role->name !== 'Admin') {
            return response()->json(['message' => 'Only Admins can manage drivers'], 403);
        }

        $driver = Driver::find($id);

        if (!$driver) {
            return response()->json(['message' => 'Driver not found'], 404);
        }

        $driver->delete();

        return response()->json(['message' => 'Driver deleted successfully']);
    }
}