<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of users
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with(['role', 'role.warehouse']);

        // Filter by role
        if ($request->has('role_id')) {
            $query->where('role_id', $request->role_id);
        }

        $users = $query->orderBy('fullname')->get();

        // Hide passwords
        $users->makeHidden(['password']);

        return response()->json($users);
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'username' => 'required|string|max:100|unique:users,username',
            'password' => 'required|string|min:6',
            'fullname' => 'required|string|max:100',
            'role_id' => 'required|exists:roles,id',
        ]);

        // Hash password (assuming MD5 based on your current data, but bcrypt is recommended)
        $validated['password'] = md5($validated['password']);
        // For better security, use: $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        return response()->json([
            'message' => 'User created successfully',
            'data' => $user->load('role')->makeHidden(['password'])
        ], 201);
    }

    /**
     * Display the specified user
     */
    public function show(string $id): JsonResponse
    {
        $user = User::with(['role', 'role.warehouse'])->findOrFail($id);
        $user->makeHidden(['password']);

        return response()->json($user);
    }

    /**
     * Update the specified user
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'username' => 'sometimes|required|string|max:100|unique:users,username,' . $id,
            'password' => 'sometimes|nullable|string|min:6',
            'fullname' => 'sometimes|required|string|max:100',
            'role_id' => 'sometimes|required|exists:roles,id',
        ]);

        // Hash password if provided
        if (isset($validated['password']) && !empty($validated['password'])) {
            $validated['password'] = md5($validated['password']);
            // For better security, use: $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully',
            'data' => $user->load('role')->makeHidden(['password'])
        ]);
    }

    /**
     * Remove the specified user
     */
    public function destroy(string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // Prevent deleting own account (if authenticated)
        if (auth()->check() && auth()->id() === $user->id) {
            return response()->json([
                'message' => 'Cannot delete your own account'
            ], 400);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }

    /**
     * Get all roles
     */
    public function getRoles(): JsonResponse
    {
        $roles = \App\Models\Role::with('warehouse')->get();

        return response()->json($roles);
    }

    /**
     * Create a new role
     */
    public function createRole(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:roles,name',
            'privilieges' => 'required|string|max:100',
            'warehouse_id' => 'nullable|exists:warehouses,id',
        ]);

        $role = \App\Models\Role::create($validated);

        return response()->json([
            'message' => 'Role created successfully',
            'data' => $role->load('warehouse')
        ], 201);
    }

    /**
     * Update a role
     */
    public function updateRole(Request $request, string $roleId): JsonResponse
    {
        $role = \App\Models\Role::findOrFail($roleId);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100|unique:roles,name,' . $roleId,
            'privilieges' => 'sometimes|required|string|max:100',
            'warehouse_id' => 'nullable|exists:warehouses,id',
        ]);

        $role->update($validated);

        return response()->json([
            'message' => 'Role updated successfully',
            'data' => $role->load('warehouse')
        ]);
    }

    /**
     * Delete a role
     */
    public function deleteRole(string $roleId): JsonResponse
    {
        $role = \App\Models\Role::findOrFail($roleId);

        // Check if role is assigned to users
        if ($role->users()->exists()) {
            return response()->json([
                'message' => 'Cannot delete role that is assigned to users'
            ], 400);
        }

        $role->delete();

        return response()->json([
            'message' => 'Role deleted successfully'
        ]);
    }
}