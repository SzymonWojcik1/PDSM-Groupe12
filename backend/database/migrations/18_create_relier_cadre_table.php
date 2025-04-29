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
        Schema::create('relier_cadre', function (Blueprint $table) {
            $table->unsignedBigInteger('rel_act_id'); // Référence activité
            $table->unsignedBigInteger('rel_ind_id'); // Référence indicateur

            $table->timestamps();

            // Clé étrangère vers la table activites
            $table->foreign('rel_act_id')
                  ->references('act_id')
                  ->on('activites')
                  ->onDelete('cascade');

            // Clé étrangère vers la table indicateur
            $table->foreign('rel_ind_id')
                  ->references('ind_id')
                  ->on('indicateur')
                  ->onDelete('cascade');

            // Clé primaire composite (optionnelle mais recommandée pour éviter les doublons)
            $table->primary(['rel_act_id', 'rel_ind_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('relier_cadre');
    }
};