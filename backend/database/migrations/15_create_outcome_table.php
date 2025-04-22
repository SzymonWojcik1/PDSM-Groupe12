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
        Schema::create('outcome', function (Blueprint $table) {
            $table->id('out_id');                      // Clé primaire
            $table->text('out_information');           // Description de l'outcome/output
            $table->unsignedBigInteger('out_obj_id');  // Clé étrangère vers objectif_general
            $table->integer('out_outcome')->nullable(); // Numéro de l'outcome (facultatif si pas toujours renseigné)
            $table->string('out_type');                // "Outcome" ou "Output"

            $table->timestamps();

            // Déclaration de la clé étrangère
            $table->foreign('out_obj_id')
                  ->references('obj_id')
                  ->on('objectif_general')
                  ->onDelete('cascade'); // Supprime les outcomes si l’objectif est supprimé
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('outcome');
    }
};