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
        Schema::create('objectif_general', function (Blueprint $table) {
            $table->id('obj_id');                    // Clé primaire
            $table->string('obj_nom');               // Nom de l’objectif
            $table->unsignedBigInteger('obj_cad_id'); // Clé étrangère vers cadre_logique

            $table->timestamps();

            // Clé étrangère : obj_cad_id → cadre_logique.cad_id
            $table->foreign('obj_cad_id')
                  ->references('cad_id')
                  ->on('cadre_logique')
                  ->onDelete('cascade'); // Supprimer les objectifs liés si le cadre est supprimé
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('objectif_general');
    }
};
