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
        Schema::create('evaluation', function (Blueprint $table) {
            $table->id('eva_id'); // Clé primaire
            $table->string('eva_statut'); // Statut de l'évaluation (en cours, soumise, validée, etc.)
            $table->timestamp('eva_date_soumission')->nullable(); // Date de soumission de l'évaluation
            $table->json('criteres'); // Critères d'évaluation, stockés en JSON pour flexibilité
            $table->unsignedBigInteger('eva_use_id'); // Référence vers la table users

            

            $table->timestamps();

            // Clé étrangère vers la table users
            $table->foreign('eva_use_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade'); // Si un utilisateur est supprimé, l'évaluation aussi
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluation');
    }
};