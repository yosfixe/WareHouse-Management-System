<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TruckDriverSeeder extends Seeder
{
    public function run(): void
    {
        // ─── TRUCKS ───────────────────────────────────────────────────
        DB::table('trucks')->insert([
            ['plate' => 'ABC-1234', 'model' => 'Mercedes Actros',     'capacity' => 8000,  'created_at' => now(), 'updated_at' => now()],
            ['plate' => 'DEF-5678', 'model' => 'Volvo FH16',          'capacity' => 10000, 'created_at' => now(), 'updated_at' => now()],
            ['plate' => 'GHI-9012', 'model' => 'MAN TGX',             'capacity' => 7500,  'created_at' => now(), 'updated_at' => now()],
            ['plate' => 'JKL-3456', 'model' => 'Scania R450',         'capacity' => 9000,  'created_at' => now(), 'updated_at' => now()],
            ['plate' => 'MNO-7890', 'model' => 'Renault T High',      'capacity' => 6000,  'created_at' => now(), 'updated_at' => now()],
        ]);

        $trucks = DB::table('trucks')->pluck('id', 'plate');

        // ─── DRIVERS ──────────────────────────────────────────────────
        DB::table('drivers')->insert([
            ['name' => 'Karim Benali',    'phone' => '+212 612-345678', 'truck_id' => $trucks['ABC-1234'], 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Youssef Alami',   'phone' => '+212 623-456789', 'truck_id' => $trucks['DEF-5678'], 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Hassan Idrissi',  'phone' => '+212 634-567890', 'truck_id' => $trucks['GHI-9012'], 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Omar Tazi',       'phone' => '+212 645-678901', 'truck_id' => $trucks['JKL-3456'], 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Rachid Moussaoui','phone' => '+212 656-789012', 'truck_id' => null,                'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Mehdi Chraibi',   'phone' => '+212 667-890123', 'truck_id' => null,                'created_at' => now(), 'updated_at' => now()],
        ]);

        $drivers = DB::table('drivers')->pluck('id', 'name');

        // ─── UPDATE STOCK MOVEMENTS WITH DRIVERS ─────────────────────
        // Fetch movements by type to assign drivers logically
        $movements = DB::table('stock_movements')->orderBy('id')->get();

        foreach ($movements as $movement) {
            $driverId = null;

            // Only IN, OUT, TRANSFER get drivers — not ADJUSTMENT
            if ($movement->movement_type === 'ADJUSTMENT') continue;

            switch ($movement->movement_type) {
                case 'IN':
                    // Rotate between Karim and Youssef for incoming deliveries
                    $driverId = ($movement->id % 2 === 0)
                        ? $drivers['Karim Benali']
                        : $drivers['Youssef Alami'];
                    break;
                case 'OUT':
                    // Rotate between Hassan and Omar for outgoing deliveries
                    $driverId = ($movement->id % 2 === 0)
                        ? $drivers['Hassan Idrissi']
                        : $drivers['Omar Tazi'];
                    break;
                case 'TRANSFER':
                    // Youssef handles transfers
                    $driverId = $drivers['Youssef Alami'];
                    break;
            }

            DB::table('stock_movements')
                ->where('id', $movement->id)
                ->update(['driver_id' => $driverId]);
        }
    }
}