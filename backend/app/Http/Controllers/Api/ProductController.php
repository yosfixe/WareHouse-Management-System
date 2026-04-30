<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    /**
     * Display a listing of products
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with('stocks.location.warehouse');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
        }

        if ($request->has('expiry_required')) {
            $query->where('expiry_required', $request->expiry_required);
        }

        $products = $query->orderBy('name')->get();
        return response()->json($products);
    }

    /**
     * Store a newly created product
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'sku'           => 'required|string|max:100|unique:products,sku',
            'description'   => 'nullable|string',
            'unit'          => 'required|string|max:255',
            'minimum_level' => 'required|integer|min:0',
            'expiry_required' => 'required|boolean',
        ]);

        $product = Product::create($validated);
        return response()->json([
            'message' => 'Product created successfully',
            'data'    => $product
        ], 201);
    }

    /**
     * Display the specified product
     */
    public function show(string $id): JsonResponse
    {
        $product = Product::with('stocks.location.warehouse')->findOrFail($id);
        return response()->json($product);
    }

    /**
     * Update the specified product
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name'          => 'sometimes|required|string|max:255',
            'sku'           => 'sometimes|required|string|max:100|unique:products,sku,' . $id,
            'description'   => 'nullable|string',
            'unit'          => 'sometimes|required|string|max:255',
            'minimum_level' => 'sometimes|required|integer|min:0',
            'expiry_required' => 'sometimes|required|boolean',
        ]);

        $product->update($validated);
        return response()->json([
            'message' => 'Product updated successfully',
            'data'    => $product
        ]);
    }

    /**
     * Remove the specified product
     */
    public function destroy(string $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        if ($product->stocks()->exists()) {
            return response()->json([
                'message' => 'Cannot delete product with existing stock'
            ], 400);
        }

        $product->delete();
        return response()->json(['message' => 'Product deleted successfully']);
    }

    /**
     * Get products with low stock
     */
    public function lowStock(): JsonResponse
    {
        $products = Product::with('stocks')
            ->get()
            ->filter(function ($product) {
                $totalStock = $product->stocks->sum('quantity');
                return $totalStock < $product->minimum_level;
            })
            ->values()
            ->map(function ($product) {
                return [
                    'id'            => $product->id,
                    'name'          => $product->name,
                    'sku'           => $product->sku,
                    'minimum_level' => $product->minimum_level,
                    'current_stock' => $product->stocks->sum('quantity'),
                ];
            });

        return response()->json($products);
    }
}