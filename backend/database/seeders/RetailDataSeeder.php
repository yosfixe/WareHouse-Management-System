<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RetailDataSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();
        $adminUserId = DB::table('users')->first()->id;

        // ─── LOCATIONS ───────────────────────────────────────────────
        // Central Warehouse (id: 1) — 4 locations
        // Secondary Warehouse (id: 2) — 3 existing, add 2 more
        // Third Warehouse (id: 8) — 4 new locations
        // Temporary test (id: 10) — 2 locations

        DB::table('locations')->insertOrIgnore([
            // Central Warehouse (id: 1)
            ['warehouse_id' => 1, 'code' => 'A-02', 'description' => 'Shelf A02',        'created_at' => $now, 'updated_at' => $now],
            ['warehouse_id' => 1, 'code' => 'A-03', 'description' => 'Shelf A03',        'created_at' => $now, 'updated_at' => $now],
            ['warehouse_id' => 1, 'code' => 'B-02', 'description' => 'Rack B02',         'created_at' => $now, 'updated_at' => $now],
            ['warehouse_id' => 1, 'code' => 'CS-01','description' => 'Cold Storage CS01', 'created_at' => $now, 'updated_at' => $now],
            // Secondary Warehouse (id: 2)
            ['warehouse_id' => 2, 'code' => 'E-01', 'description' => 'Shelf E01',        'created_at' => $now, 'updated_at' => $now],
            ['warehouse_id' => 2, 'code' => 'E-02', 'description' => 'Shelf E02',        'created_at' => $now, 'updated_at' => $now],
            // Third Warehouse (id: 8)
            ['warehouse_id' => 8, 'code' => 'F-01', 'description' => 'Rack F01',         'created_at' => $now, 'updated_at' => $now],
            ['warehouse_id' => 8, 'code' => 'F-02', 'description' => 'Rack F02',         'created_at' => $now, 'updated_at' => $now],
            ['warehouse_id' => 8, 'code' => 'G-01', 'description' => 'Shelf G01',        'created_at' => $now, 'updated_at' => $now],
            ['warehouse_id' => 8, 'code' => 'G-02', 'description' => 'Shelf G02',        'created_at' => $now, 'updated_at' => $now],
            // Temporary test (id: 10)
            ['warehouse_id' => 10, 'code' => 'T-01','description' => 'Temp Shelf T01',   'created_at' => $now, 'updated_at' => $now],
            ['warehouse_id' => 10, 'code' => 'T-02','description' => 'Temp Shelf T02',   'created_at' => $now, 'updated_at' => $now],
        ]);

        // Fetch all location IDs by code for easy reference
        $loc = DB::table('locations')->pluck('id', 'code');

        // ─── PRODUCTS ────────────────────────────────────────────────
        DB::table('products')->insert([
            // Electronics
            ['name' => 'USB-C Charging Cable 2m',  'sku' => 'ELEC-001', 'description' => 'Fast charge USB-C cable, 2 meters',      'unit' => 'pcs',  'minimum_level' => 20,  'expiryDate' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Wireless Mouse',           'sku' => 'ELEC-002', 'description' => 'Ergonomic wireless mouse 2.4GHz',        'unit' => 'pcs',  'minimum_level' => 10,  'expiryDate' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'HDMI Cable 1.5m',          'sku' => 'ELEC-003', 'description' => 'HDMI 2.0 cable, 1.5 meters',            'unit' => 'pcs',  'minimum_level' => 15,  'expiryDate' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Bluetooth Earbuds',        'sku' => 'ELEC-004', 'description' => 'True wireless stereo earbuds',          'unit' => 'pcs',  'minimum_level' => 10,  'expiryDate' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Power Bank 10000mAh',      'sku' => 'ELEC-005', 'description' => 'Compact power bank dual USB output',    'unit' => 'pcs',  'minimum_level' => 8,   'expiryDate' => null, 'created_at' => $now, 'updated_at' => $now],
            // Office Supplies
            ['name' => 'A4 Paper Ream 500 sheets', 'sku' => 'OFFC-001', 'description' => '80gsm white A4 printing paper',        'unit' => 'ream', 'minimum_level' => 50,  'expiryDate' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Ballpoint Pen Box',        'sku' => 'OFFC-002', 'description' => 'Box of 50 blue ballpoint pens',        'unit' => 'box',  'minimum_level' => 20,  'expiryDate' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Stapler',                  'sku' => 'OFFC-003', 'description' => 'Heavy duty desktop stapler',           'unit' => 'pcs',  'minimum_level' => 5,   'expiryDate' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Sticky Notes Pack',        'sku' => 'OFFC-004', 'description' => 'Pack of 6 sticky note pads 75x75mm',  'unit' => 'pack', 'minimum_level' => 30,  'expiryDate' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Scissors',                 'sku' => 'OFFC-005', 'description' => 'Stainless steel office scissors',     'unit' => 'pcs',  'minimum_level' => 5,   'expiryDate' => null, 'created_at' => $now, 'updated_at' => $now],
            // Cleaning Supplies — these have expiry dates
            ['name' => 'All-Purpose Cleaner 1L',  'sku' => 'CLEN-001', 'description' => 'Multi-surface cleaning spray 1 liter', 'unit' => 'btl',  'minimum_level' => 20,  'expiryDate' => Carbon::now()->addMonths(18)->toDateString(), 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Microfiber Cloth Pack',   'sku' => 'CLEN-002', 'description' => 'Pack of 10 microfiber cleaning cloths','unit' => 'pack', 'minimum_level' => 15,  'expiryDate' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Hand Sanitizer 500ml',    'sku' => 'CLEN-003', 'description' => '70% alcohol hand sanitizer',           'unit' => 'btl',  'minimum_level' => 25,  'expiryDate' => Carbon::now()->addMonths(12)->toDateString(), 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Garbage Bags Roll 50L',   'sku' => 'CLEN-004', 'description' => 'Roll of 20 heavy duty garbage bags',   'unit' => 'roll', 'minimum_level' => 30,  'expiryDate' => null, 'created_at' => $now, 'updated_at' => $now],
            // Packaging
            ['name' => 'Cardboard Box Small',     'sku' => 'PACK-001', 'description' => '20x15x10cm shipping box',              'unit' => 'pcs',  'minimum_level' => 100, 'expiryDate' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Cardboard Box Medium',    'sku' => 'PACK-002', 'description' => '40x30x20cm shipping box',              'unit' => 'pcs',  'minimum_level' => 80,  'expiryDate' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Bubble Wrap Roll 50m',    'sku' => 'PACK-003', 'description' => '50 meter bubble wrap roll',            'unit' => 'roll', 'minimum_level' => 10,  'expiryDate' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Packing Tape 48mm',       'sku' => 'PACK-004', 'description' => 'Clear packing tape 48mm x 66m',       'unit' => 'roll', 'minimum_level' => 20,  'expiryDate' => null, 'created_at' => $now, 'updated_at' => $now],
            // Safety & Tools
            ['name' => 'Safety Gloves L',         'sku' => 'SFTY-001', 'description' => 'Cut-resistant safety gloves size L',  'unit' => 'pair', 'minimum_level' => 10,  'expiryDate' => null, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Safety Helmet',           'sku' => 'SFTY-002', 'description' => 'Hard hat adjustable safety helmet',   'unit' => 'pcs',  'minimum_level' => 5,   'expiryDate' => null, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // Fetch product IDs by SKU
        $prod = DB::table('products')->pluck('id', 'sku');

        // ─── STOCKS ──────────────────────────────────────────────────
        $stocks = [
            // Central Warehouse — A-01, A-02, B-01, B-02
            ['product_id' => $prod['ELEC-001'], 'location_id' => $loc['A-01'], 'quantity' => 85],
            ['product_id' => $prod['ELEC-002'], 'location_id' => $loc['A-01'], 'quantity' => 32],
            ['product_id' => $prod['ELEC-003'], 'location_id' => $loc['A-02'], 'quantity' => 50],
            ['product_id' => $prod['ELEC-004'], 'location_id' => $loc['A-02'], 'quantity' => 18],
            ['product_id' => $prod['ELEC-005'], 'location_id' => $loc['A-03'], 'quantity' => 7],  // below min
            ['product_id' => $prod['OFFC-001'], 'location_id' => $loc['B-01'], 'quantity' => 120],
            ['product_id' => $prod['OFFC-002'], 'location_id' => $loc['B-01'], 'quantity' => 45],
            ['product_id' => $prod['OFFC-003'], 'location_id' => $loc['B-02'], 'quantity' => 3],  // below min
            ['product_id' => $prod['OFFC-004'], 'location_id' => $loc['B-02'], 'quantity' => 60],
            ['product_id' => $prod['OFFC-005'], 'location_id' => $loc['B-02'], 'quantity' => 12],
            // Secondary Warehouse — C-01, C-02, D-01, E-01, E-02
            ['product_id' => $prod['CLEN-001'], 'location_id' => $loc['C-01'], 'quantity' => 40],
            ['product_id' => $prod['CLEN-002'], 'location_id' => $loc['C-01'], 'quantity' => 25],
            ['product_id' => $prod['CLEN-003'], 'location_id' => $loc['C-02'], 'quantity' => 10], // below min
            ['product_id' => $prod['CLEN-004'], 'location_id' => $loc['C-02'], 'quantity' => 55],
            ['product_id' => $prod['PACK-001'], 'location_id' => $loc['D-01'], 'quantity' => 200],
            ['product_id' => $prod['PACK-002'], 'location_id' => $loc['D-01'], 'quantity' => 150],
            ['product_id' => $prod['PACK-003'], 'location_id' => $loc['E-01'], 'quantity' => 8],  // below min
            ['product_id' => $prod['PACK-004'], 'location_id' => $loc['E-01'], 'quantity' => 35],
            // Third Warehouse — F-01, F-02, G-01
            ['product_id' => $prod['SFTY-001'], 'location_id' => $loc['F-01'], 'quantity' => 22],
            ['product_id' => $prod['SFTY-002'], 'location_id' => $loc['F-01'], 'quantity' => 4],  // below min
            ['product_id' => $prod['ELEC-001'], 'location_id' => $loc['F-02'], 'quantity' => 30], // same product, different warehouse
            ['product_id' => $prod['PACK-001'], 'location_id' => $loc['G-01'], 'quantity' => 90],
        ];

        foreach ($stocks as &$s) {
            $s['created_at'] = $now;
            $s['updated_at'] = $now;
        }

        DB::table('stocks')->insert($stocks);

        // Fetch inserted stock IDs
        $stockRecords = DB::table('stocks')->get()->keyBy(function($s) {
            return $s->product_id . '_' . $s->location_id;
        });

        $getStockId = function($sku, $locationCode) use ($prod, $loc, $stockRecords) {
            $key = $prod[$sku] . '_' . $loc[$locationCode];
            return $stockRecords[$key]->id ?? null;
        };

        // ─── STOCK MOVEMENTS ─────────────────────────────────────────
        $movements = [
            // IN movements
            ['stock_id' => $getStockId('ELEC-001', 'A-01'), 'user_id' => $adminUserId, 'movement_type' => 'IN',       'from_location_id' => null,          'to_location_id' => $loc['A-01'], 'quantity' => 100, 'reason' => 'Initial stock intake',          'timestamp' => Carbon::now()->subDays(30)],
            ['stock_id' => $getStockId('ELEC-002', 'A-01'), 'user_id' => $adminUserId, 'movement_type' => 'IN',       'from_location_id' => null,          'to_location_id' => $loc['A-01'], 'quantity' => 40,  'reason' => 'Initial stock intake',          'timestamp' => Carbon::now()->subDays(28)],
            ['stock_id' => $getStockId('OFFC-001', 'B-01'), 'user_id' => $adminUserId, 'movement_type' => 'IN',       'from_location_id' => null,          'to_location_id' => $loc['B-01'], 'quantity' => 150, 'reason' => 'Initial stock intake',          'timestamp' => Carbon::now()->subDays(28)],
            ['stock_id' => $getStockId('CLEN-001', 'C-01'), 'user_id' => $adminUserId, 'movement_type' => 'IN',       'from_location_id' => null,          'to_location_id' => $loc['C-01'], 'quantity' => 50,  'reason' => 'Initial stock intake',          'timestamp' => Carbon::now()->subDays(28)],
            ['stock_id' => $getStockId('PACK-001', 'D-01'), 'user_id' => $adminUserId, 'movement_type' => 'IN',       'from_location_id' => null,          'to_location_id' => $loc['D-01'], 'quantity' => 300, 'reason' => 'Bulk order received',           'timestamp' => Carbon::now()->subDays(25)],
            ['stock_id' => $getStockId('SFTY-001', 'F-01'), 'user_id' => $adminUserId, 'movement_type' => 'IN',       'from_location_id' => null,          'to_location_id' => $loc['F-01'], 'quantity' => 25,  'reason' => 'Safety equipment restock',      'timestamp' => Carbon::now()->subDays(20)],
            ['stock_id' => $getStockId('ELEC-004', 'A-02'), 'user_id' => $adminUserId, 'movement_type' => 'IN',       'from_location_id' => null,          'to_location_id' => $loc['A-02'], 'quantity' => 18,  'reason' => 'New shipment received',         'timestamp' => Carbon::now()->subDays(2)],
            ['stock_id' => $getStockId('CLEN-004', 'C-02'), 'user_id' => $adminUserId, 'movement_type' => 'IN',       'from_location_id' => null,          'to_location_id' => $loc['C-02'], 'quantity' => 55,  'reason' => 'Monthly restock',               'timestamp' => Carbon::now()->subDays(1)],
            ['stock_id' => $getStockId('PACK-004', 'E-01'), 'user_id' => $adminUserId, 'movement_type' => 'IN',       'from_location_id' => null,          'to_location_id' => $loc['E-01'], 'quantity' => 35,  'reason' => 'Packaging reorder arrived',     'timestamp' => Carbon::now()->subHours(6)],
            // OUT movements
            ['stock_id' => $getStockId('ELEC-001', 'A-01'), 'user_id' => $adminUserId, 'movement_type' => 'OUT',      'from_location_id' => $loc['A-01'], 'to_location_id' => null,          'quantity' => 15,  'reason' => 'Customer order #1042',          'timestamp' => Carbon::now()->subDays(20)],
            ['stock_id' => $getStockId('OFFC-001', 'B-01'), 'user_id' => $adminUserId, 'movement_type' => 'OUT',      'from_location_id' => $loc['B-01'], 'to_location_id' => null,          'quantity' => 30,  'reason' => 'Office supply order dispatch',  'timestamp' => Carbon::now()->subDays(15)],
            ['stock_id' => $getStockId('CLEN-003', 'C-02'), 'user_id' => $adminUserId, 'movement_type' => 'OUT',      'from_location_id' => $loc['C-02'], 'to_location_id' => null,          'quantity' => 15,  'reason' => 'Retail outlet restocking',      'timestamp' => Carbon::now()->subDays(10)],
            ['stock_id' => $getStockId('PACK-002', 'D-01'), 'user_id' => $adminUserId, 'movement_type' => 'OUT',      'from_location_id' => $loc['D-01'], 'to_location_id' => null,          'quantity' => 50,  'reason' => 'Shipping department request',   'timestamp' => Carbon::now()->subDays(8)],
            // TRANSFER movements
            ['stock_id' => $getStockId('ELEC-001', 'A-01'), 'user_id' => $adminUserId, 'movement_type' => 'TRANSFER', 'from_location_id' => $loc['A-01'], 'to_location_id' => $loc['F-02'],  'quantity' => 30,  'reason' => 'Overflow to third warehouse',   'timestamp' => Carbon::now()->subDays(12)],
            ['stock_id' => $getStockId('PACK-001', 'D-01'), 'user_id' => $adminUserId, 'movement_type' => 'TRANSFER', 'from_location_id' => $loc['D-01'], 'to_location_id' => $loc['G-01'],  'quantity' => 90,  'reason' => 'Balance stock across warehouses','timestamp' => Carbon::now()->subDays(7)],
            // ADJUSTMENT movements
            ['stock_id' => $getStockId('ELEC-002', 'A-01'), 'user_id' => $adminUserId, 'movement_type' => 'ADJUSTMENT','from_location_id' => null,         'to_location_id' => $loc['A-01'], 'quantity' => 8,   'reason' => 'Inventory count correction',    'timestamp' => Carbon::now()->subDays(5)],
            ['stock_id' => $getStockId('OFFC-003', 'B-02'), 'user_id' => $adminUserId, 'movement_type' => 'ADJUSTMENT','from_location_id' => null,         'to_location_id' => $loc['B-02'], 'quantity' => 2,   'reason' => 'Damaged items written off',     'timestamp' => Carbon::now()->subDays(3)],
            ['stock_id' => $getStockId('SFTY-002', 'F-01'), 'user_id' => $adminUserId, 'movement_type' => 'ADJUSTMENT','from_location_id' => null,         'to_location_id' => $loc['F-01'], 'quantity' => 1,   'reason' => 'Lost item adjustment',          'timestamp' => Carbon::now()->subDays(2)],
        ];

        DB::table('stock_movements')->insert($movements);
    }
}