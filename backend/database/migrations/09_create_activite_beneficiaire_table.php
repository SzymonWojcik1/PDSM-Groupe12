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
        Schema::create('activite_beneficiaire', function (Blueprint $table) {
            $table->id('acb_id');
            $table->unsignedBigInteger('acb_act_id');
            $table->unsignedBigInteger('acb_ben_id');
            $table->timestamps();

            // Clés étrangères
            $table->foreign('acb_act_id')
                  ->references('act_id')
                  ->on('activites')
                  ->onDelete('cascade');

            $table->foreign('acb_ben_id')
                  ->references('ben_id')
                  ->on('beneficiaires')
                  ->onDelete('cascade');

            // Index unique pour éviter les doublons
            $table->unique(['acb_act_id', 'acb_ben_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activite_beneficiaire');
    }
};
