<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
        $table->id();
        $table->foreignId('stock_id')->constrained('stocks');
        $table->foreignId('user_id')->nullable()->onstrained('users');
        $table->string('reason')->nullable();
        $table->integer('quantity');
        $table->timestamp('timestamp');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
