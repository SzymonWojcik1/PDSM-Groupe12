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
        Schema::create('assure', function (Blueprint $table) {
            $table->unsignedBigInteger('ass_use_id'); // Référence vers users
            $table->unsignedBigInteger('ass_pro_id'); // Référence vers projets

            $table->timestamps();

            // Clé étrangère vers users
            $table->foreign('ass_use_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');

            // Clé étrangère vers projet
            $table->foreign('ass_pro_id')
                  ->references('pro_id') // Assure-toi que c'est bien pro_id dans ta table projets
                  ->on('projet')
                  ->onDelete('cascade');

            // Clé primaire composite pour éviter les doublons
            $table->primary(['ass_use_id', 'ass_pro_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assure');
    }
};