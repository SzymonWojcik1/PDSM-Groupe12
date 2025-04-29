<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('outcome', function (Blueprint $table) {
            $table->id('out_id');
            $table->unsignedBigInteger('obj_id');
            $table->text('out_nom');
            $table->timestamps();

            $table->foreign('obj_id')->references('obj_id')->on('objectif_general')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('outcome');
    }
};