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
        Schema::create('projet', function (Blueprint $table) {
            $table->id('pro_id');
            $table->string('pro_nom');
            $table->date('pro_dateDebut');
            $table->date('pro_dateFin');
            $table->unsignedBigInteger('pro_part_id');
            $table->foreign('pro_part_id')->references('part_id')->on('partenaires');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projet');
    }
};
