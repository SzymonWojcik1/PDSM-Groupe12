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
        Schema::create('logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable(); // utilisateur concerné
            $table->string('level')->default('info'); // info, warning, error…
            $table->string('action'); // action décrite
            $table->text('message')->nullable(); // message supplémentaire
            $table->json('context')->nullable(); // pour stocker des détails supplémentaires
            $table->timestamps(); // created_at = date de l’action
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('logs');
    }
};
