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
        Schema::create('critere', function (Blueprint $table) {
            $table->id('cri_id');                     // Clé primaire
            $table->string('cri_texte');              // Texte du critère
            $table->unsignedBigInteger('cri_que_id'); // FK vers la table question

            $table->timestamps();

            // Clé étrangère : cri_que_id → question.que_id
            $table->foreign('cri_que_id')
                  ->references('que_id')
                  ->on('question')
                  ->onDelete('cascade'); // Supprime les critères si la question est supprimée
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('critere');
    }
};