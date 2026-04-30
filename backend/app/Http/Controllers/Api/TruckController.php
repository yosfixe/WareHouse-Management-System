<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Truck;
use Illuminate\Http\Request;

class TruckController extends Controller
{
    public function index()
    {
        $trucks = Truck::with('driver')->get();
        return response()->json($trucks);
    }

    public function store(Request $request)
    {
        if ($request->user()->role->name !== 'Admin') {
            return response()->json(['message' => 'Only Admins can manage trucks'], 403);
        }

        $validated = $request->validate([
            'plate'    => 'required|string|unique:trucks,plate',
            'model'    => 'required|string',
            'capacity' => 'required|integer|min:1',
        ]);

        $truck = Truck::create($validated);
        $truck->load('driver');

        return response()->json([
            'message' => 'Truck created successfully',
            'truck'   => $truck
        ], 201);
    }

    public function show($id)
    {
        $truck = Truck::with('driver')->find($id);

        if (!$truck) {
            return response()->json(['message' => 'Truck not found'], 404);
        }

        return response()->json($truck);
    }

    public function update(Request $request, $id)
    {
        if ($request->user()->role->name !== 'Admin') {
            return response()->json(['message' => 'Only Admins can manage trucks'], 403);
        }

        $truck = Truck::find($id);

        if (!$truck) {
            return response()->json(['message' => 'Truck not found'], 404);
        }

        $validated = $request->validate([
            'plate'    => 'sometimes|required|string|unique:trucks,plate,' . $id,
            'model'    => 'sometimes|required|string',
            'capacity' => 'sometimes|required|integer|min:1',
        ]);

        $truck->update($validated);
        $truck->load('driver');

        return response()->json([
            'message' => 'Truck updated successfully',
            'truck'   => $truck
        ]);
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role->name !== 'Admin') {
            return response()->json(['message' => 'Only Admins can manage trucks'], 403);
        }

        $truck = Truck::find($id);

        if (!$truck) {
            return response()->json(['message' => 'Truck not found'], 404);
        }

        $truck->delete();

        return response()->json(['message' => 'Truck deleted successfully']);
    }
}