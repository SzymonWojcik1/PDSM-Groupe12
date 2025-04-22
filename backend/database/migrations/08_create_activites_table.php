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
        Schema::create('activites', function (Blueprint $table) {
            $table->id('act_id');
            $table->string('act_nom');
            $table->date('act_dateDebut');
            $table->date('act_dateFin');
            $table->unsignedBigInteger('act_part_id');
            $table->foreign('act_part_id')->references('part_id')->on('partenaires');
            $table->unsignedBigInteger('act_pro_id');
            $table->foreign('act_pro_id')->references('pro_id')->on('projet');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activites');
    }
};
