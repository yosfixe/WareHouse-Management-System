<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\User;

class AuthController extends Controller
{
    /**
     * Login user and create token
     */
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required',
        ]);

        $user = User::where('username', $request->username)->first();

        // Check password with MD5
        if (!$user || md5($request->password) !== $user->password) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Load user role with warehouse
        $user->load(['role', 'role.warehouse']);

        return response()->json([
            'token' => $user->createToken('api-token')->plainTextToken,
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'fullname' => $user->fullname,
                'role' => [
                    'id' => $user->role->id,
                    'name' => $user->role->name,
                    'privilieges' => $user->role->privilieges,
                    'warehouse_id' => $user->role->warehouse_id,
                    'warehouse' => $user->role->warehouse,
                ],
            ]
        ]);
    }

    /**
     * Get authenticated user info
     */
    public function user(Request $request)
    {
        $user = $request->user();
        $user->load(['role', 'role.warehouse']);

        return response()->json([
            'id' => $user->id,
            'username' => $user->username,
            'fullname' => $user->fullname,
            'role' => [
                'id' => $user->role->id,
                'name' => $user->role->name,
                'privilieges' => $user->role->privilieges,
                'warehouse_id' => $user->role->warehouse_id,
                'warehouse' => $user->role->warehouse,
            ],
        ]);
    }

    /**
     * Logout user (revoke token)
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }
}