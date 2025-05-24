<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('evaluations', function (Blueprint $table) {
            $table->id('eva_id');
            $table->foreignId('eva_use_id')
                ->constrained('users', 'id')
                ->onDelete('cascade');

            $table->enum('eva_statut', ['en_attente', 'soumis', 'valide'])->default('en_attente');
            $table->timestamp('eva_date_soumission')->nullable();

            // Nouveau champ JSON pour stocker les critères et leur résultat (true = réussi)
            $table->json('criteres');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluations');
    }
};
