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
        Schema::create('products', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('sku', 100)->unique();
        $table->text('description')->nullable();
        $table->string('unit');
        $table->integer('minimum_level')->default(0);
        $table->date('expiryDate')->default(null);
        $table->timestamps();
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
