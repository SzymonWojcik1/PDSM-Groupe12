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
        Schema::create('resultat', function (Blueprint $table) {
            $table->id('res_id');                      // Clé primaire
            $table->text('res_information');           // Description du résultat
            $table->unsignedBigInteger('res_act_id');  // Clé étrangère vers activité

            $table->timestamps();

            // Clé étrangère vers activites.act_id
            $table->foreign('res_act_id')
                  ->references('act_id')
                  ->on('activites')
                  ->onDelete('cascade'); // Supprime les résultats liés à une activité supprimée
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resultat');
    }
};