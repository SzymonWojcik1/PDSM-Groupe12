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
        Schema::create('question', function (Blueprint $table) {
            $table->id('que_id');                  // Clé primaire
            $table->string('que_texte');           // Texte de la question
            $table->unsignedBigInteger('que_eva_id'); // FK vers evaluation.eva_id

            $table->timestamps();

            // Clé étrangère : que_eva_id → evaluation.eva_id
            $table->foreign('que_eva_id')
                  ->references('eva_id')
                  ->on('evaluation')
                  ->onDelete('cascade'); // Si une évaluation est supprimée, les questions aussi
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('question');
    }
};