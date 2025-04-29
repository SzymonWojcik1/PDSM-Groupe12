<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('objectif_general', function (Blueprint $table) {
            $table->id('obj_id');
            $table->foreignId('cad_id')->constrained('cadre_logique', 'cad_id')->onDelete('cascade');
            $table->text('obj_nom');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('objectif_general');
    }
};