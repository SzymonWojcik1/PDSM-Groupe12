<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('output', function (Blueprint $table) {
            $table->id('opu_id');
            $table->unsignedBigInteger('out_id');
            $table->string('opu_code', 20);
            $table->text('opu_nom');
            $table->timestamps();

            $table->foreign('out_id')->references('out_id')->on('outcome')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('output');
    }
};