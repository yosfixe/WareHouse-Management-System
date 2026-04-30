<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StockMovementSeeder extends Seeder
{
    public function run(): void
    {
        $adminUserId = DB::table('users')->first()->id;

        // Driver IDs from TruckDriverSeeder
        $drivers = DB::table('drivers')->pluck('id', 'name');
        $karim   = $drivers['Karim Benali'];
        $youssef = $drivers['Youssef Alami'];
        $hassan  = $drivers['Hassan Idrissi'];
        $omar    = $drivers['Omar Tazi'];

        // Location map for reference
        // 1=A-01(wh1), 2=B-01(wh1), 3=C-01(wh2), 4=C-02(wh2), 5=D-01(wh2)
        // 6=A-02(wh1), 7=A-03(wh1), 8=B-02(wh1), 9=CS-01(wh1), 10=E-01(wh2)
        // 11=E-02(wh2), 12=F-01(wh8), 13=F-02(wh8), 14=G-01(wh8), 15=G-02(wh8)
        // 16=T-01(wh10), 17=T-02(wh10)

        // Stock map for reference
        // 1=prod1@loc1, 2=prod2@loc1, 3=prod3@loc6, 4=prod4@loc6
        // 5=prod5@loc7, 6=prod6@loc2, 7=prod7@loc2, 8=prod8@loc8
        // 9=prod9@loc8, 10=prod10@loc8, 11=prod11@loc3, 12=prod12@loc3
        // 13=prod13@loc4, 14=prod14@loc4, 15=prod15@loc5, 16=prod16@loc5
        // 17=prod17@loc10, 18=prod18@loc10, 19=prod19@loc12, 20=prod20@loc12
        // 21=prod1@loc13, 22=prod15@loc14

        $movements = [
            // ── Week 1: Initial restocking ────────────────────────────
            ['stock_id' => 1,  'user_id' => $adminUserId, 'movement_type' => 'IN',       'from_location_id' => null, 'to_location_id' => 1,    'driver_id' => $karim,   'quantity' => 50,  'reason' => 'Weekly restock — USB cables',          'timestamp' => Carbon::now()->subDays(28)],
            ['stock_id' => 6,  'user_id' => $adminUserId, 'movement_type' => 'IN',       'from_location_id' => null, 'to_location_id' => 2,    'driver_id' => $youssef, 'quantity' => 80,  'reason' => 'Paper restock from supplier',          'timestamp' => Carbon::now()->subDays(27)],
            ['stock_id' => 15, 'user_id' => $adminUserId, 'movement_type' => 'IN',       'from_location_id' => null, 'to_location_id' => 5,    'driver_id' => $karim,   'quantity' => 120, 'reason' => 'Bulk packaging order received',        'timestamp' => Carbon::now()->subDays(27)],
            ['stock_id' => 11, 'user_id' => $adminUserId, 'movement_type' => 'IN',       'from_location_id' => null, 'to_location_id' => 3,    'driver_id' => $youssef, 'quantity' => 30,  'reason' => 'Cleaning supplies restock',            'timestamp' => Carbon::now()->subDays(26)],
            ['stock_id' => 19, 'user_id' => $adminUserId, 'movement_type' => 'IN',       'from_location_id' => null, 'to_location_id' => 12,   'driver_id' => $karim,   'quantity' => 15,  'reason' => 'Safety gloves initial stock',          'timestamp' => Carbon::now()->subDays(26)],

            // ── Week 1: Outgoing orders ───────────────────────────────
            ['stock_id' => 1,  'user_id' => $adminUserId, 'movement_type' => 'OUT',      'from_location_id' => 1,  'to_location_id' => null, 'driver_id' => $hassan,  'quantity' => 20,  'reason' => 'Customer order #2001 dispatched',      'timestamp' => Carbon::now()->subDays(25)],
            ['stock_id' => 6,  'user_id' => $adminUserId, 'movement_type' => 'OUT',      'from_location_id' => 2,  'to_location_id' => null, 'driver_id' => $omar,    'quantity' => 40,  'reason' => 'Office supply order #2002',            'timestamp' => Carbon::now()->subDays(24)],
            ['stock_id' => 15, 'user_id' => $adminUserId, 'movement_type' => 'OUT',      'from_location_id' => 5,  'to_location_id' => null, 'driver_id' => $hassan,  'quantity' => 60,  'reason' => 'Retail outlet #3 restocking',          'timestamp' => Carbon::now()->subDays(24)],
            ['stock_id' => 13, 'user_id' => $adminUserId, 'movement_type' => 'OUT',      'from_location_id' => 4,  'to_location_id' => null, 'driver_id' => $omar,    'quantity' => 5,   'reason' => 'Customer order #2003 dispatched',      'timestamp' => Carbon::now()->subDays(23)],

            // ── Week 2: Transfers between warehouses ──────────────────
            ['stock_id' => 2,  'user_id' => $adminUserId, 'movement_type' => 'TRANSFER', 'from_location_id' => 1,  'to_location_id' => 13,   'driver_id' => $youssef, 'quantity' => 10,  'reason' => 'Overflow transfer to third warehouse', 'timestamp' => Carbon::now()->subDays(21)],
            ['stock_id' => 16, 'user_id' => $adminUserId, 'movement_type' => 'TRANSFER', 'from_location_id' => 5,  'to_location_id' => 14,   'driver_id' => $youssef, 'quantity' => 50,  'reason' => 'Balance stock across warehouses',      'timestamp' => Carbon::now()->subDays(20)],
            ['stock_id' => 9,  'user_id' => $adminUserId, 'movement_type' => 'TRANSFER', 'from_location_id' => 8,  'to_location_id' => 10,   'driver_id' => $karim,   'quantity' => 20,  'reason' => 'Relocate sticky notes to secondary',   'timestamp' => Carbon::now()->subDays(19)],

            // ── Week 2: Adjustments ───────────────────────────────────
            ['stock_id' => 8,  'user_id' => $adminUserId, 'movement_type' => 'ADJUSTMENT','from_location_id' => null,'to_location_id' => 8,   'driver_id' => null,     'quantity' => 2,   'reason' => 'Damaged staplers written off',         'timestamp' => Carbon::now()->subDays(18)],
            ['stock_id' => 20, 'user_id' => $adminUserId, 'movement_type' => 'ADJUSTMENT','from_location_id' => null,'to_location_id' => 12,  'driver_id' => null,     'quantity' => 1,   'reason' => 'Lost helmet during inventory count',   'timestamp' => Carbon::now()->subDays(17)],
            ['stock_id' => 5,  'user_id' => $adminUserId, 'movement_type' => 'ADJUSTMENT','from_location_id' => null,'to_location_id' => 7,   'driver_id' => null,     'quantity' => 3,   'reason' => 'Power banks found damaged in storage',  'timestamp' => Carbon::now()->subDays(16)],

            // ── Week 3: New incoming shipments ────────────────────────
            ['stock_id' => 3,  'user_id' => $adminUserId, 'movement_type' => 'IN',       'from_location_id' => null, 'to_location_id' => 6,   'driver_id' => $karim,   'quantity' => 30,  'reason' => 'HDMI cable reorder arrived',           'timestamp' => Carbon::now()->subDays(14)],
            ['stock_id' => 7,  'user_id' => $adminUserId, 'movement_type' => 'IN',       'from_location_id' => null, 'to_location_id' => 2,   'driver_id' => $youssef, 'quantity' => 25,  'reason' => 'Pen box monthly restock',              'timestamp' => Carbon::now()->subDays(13)],
            ['stock_id' => 17, 'user_id' => $adminUserId, 'movement_type' => 'IN',       'from_location_id' => null, 'to_location_id' => 10,  'driver_id' => $karim,   'quantity' => 12,  'reason' => 'Bubble wrap reorder arrived',          'timestamp' => Carbon::now()->subDays(12)],
            ['stock_id' => 22, 'user_id' => $adminUserId, 'movement_type' => 'IN',       'from_location_id' => null, 'to_location_id' => 14,  'driver_id' => $youssef, 'quantity' => 60,  'reason' => 'Cardboard boxes bulk delivery',        'timestamp' => Carbon::now()->subDays(12)],

            // ── Week 3: Outgoing orders ───────────────────────────────
            ['stock_id' => 3,  'user_id' => $adminUserId, 'movement_type' => 'OUT',      'from_location_id' => 6,  'to_location_id' => null, 'driver_id' => $hassan,  'quantity' => 15,  'reason' => 'Customer order #2010 dispatched',      'timestamp' => Carbon::now()->subDays(11)],
            ['stock_id' => 11, 'user_id' => $adminUserId, 'movement_type' => 'OUT',      'from_location_id' => 3,  'to_location_id' => null, 'driver_id' => $omar,    'quantity' => 10,  'reason' => 'Cleaning supply order #2011',          'timestamp' => Carbon::now()->subDays(10)],
            ['stock_id' => 18, 'user_id' => $adminUserId, 'movement_type' => 'OUT',      'from_location_id' => 10, 'to_location_id' => null, 'driver_id' => $hassan,  'quantity' => 8,   'reason' => 'Packing tape order #2012 dispatched',  'timestamp' => Carbon::now()->subDays(9)],

            // ── Week 4: Recent activity ───────────────────────────────
            ['stock_id' => 1,  'user_id' => $adminUserId, 'movement_type' => 'IN',       'from_location_id' => null, 'to_location_id' => 1,   'driver_id' => $karim,   'quantity' => 40,  'reason' => 'Emergency USB cable restock',          'timestamp' => Carbon::now()->subDays(5)],
            ['stock_id' => 13, 'user_id' => $adminUserId, 'movement_type' => 'IN',       'from_location_id' => null, 'to_location_id' => 4,   'driver_id' => $youssef, 'quantity' => 20,  'reason' => 'Hand sanitizer reorder',               'timestamp' => Carbon::now()->subDays(4)],
            ['stock_id' => 21, 'user_id' => $adminUserId, 'movement_type' => 'TRANSFER', 'from_location_id' => 13, 'to_location_id' => 1,    'driver_id' => $youssef, 'quantity' => 15,  'reason' => 'Return overstock to central warehouse', 'timestamp' => Carbon::now()->subDays(3)],
            ['stock_id' => 4,  'user_id' => $adminUserId, 'movement_type' => 'OUT',      'from_location_id' => 6,  'to_location_id' => null, 'driver_id' => $omar,    'quantity' => 8,   'reason' => 'Earbuds order #2020 dispatched',       'timestamp' => Carbon::now()->subDays(2)],
            ['stock_id' => 12, 'user_id' => $adminUserId, 'movement_type' => 'OUT',      'from_location_id' => 3,  'to_location_id' => null, 'driver_id' => $hassan,  'quantity' => 5,   'reason' => 'Microfiber cloth order #2021',         'timestamp' => Carbon::now()->subDays(1)],
            ['stock_id' => 14, 'user_id' => $adminUserId, 'movement_type' => 'ADJUSTMENT','from_location_id' => null,'to_location_id' => 4,  'driver_id' => null,     'quantity' => 3,   'reason' => 'Garbage bags expiry adjustment',       'timestamp' => Carbon::now()->subHours(5)],
            ['stock_id' => 19, 'user_id' => $adminUserId, 'movement_type' => 'IN',       'from_location_id' => null, 'to_location_id' => 12,  'driver_id' => $karim,   'quantity' => 10,  'reason' => 'Safety gloves urgent restock',         'timestamp' => Carbon::now()->subHours(2)],
        ];

        DB::table('stock_movements')->insert($movements);
    }
}