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
        Schema::create('indicateur', function (Blueprint $table) {
            $table->id('ind_id');                       // Clé primaire
            $table->text('ind_information');            // Description de l'indicateur
            $table->unsignedBigInteger('ind_out_id');   // Clé étrangère vers outcome
            $table->integer('ind_baseline');            // Valeur de base

            // Valeurs cibles pour 4 années
            $table->integer('ind_valeurCibleAnnee1')->nullable();
            $table->integer('ind_valeurCibleAnnee2')->nullable();
            $table->integer('ind_valeurCibleAnnee3')->nullable();
            $table->integer('ind_valeurCibleAnnee4')->nullable();

            $table->timestamps();

            // Clé étrangère vers outcome.out_id
            $table->foreign('ind_out_id')
                  ->references('out_id')
                  ->on('outcome')
                  ->onDelete('cascade'); // Supprimer l’indicateur si l’outcome est supprimé
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('indicateur');
    }
};