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
        Schema::create('beneficiaires', function (Blueprint $table) {
            $table->id('ben_id');
            $table->string('ben_prenom');
            $table->string('ben_nom');
            $table->date('ben_date_naissance');
            $table->string('ben_region');
            $table->string('ben_pays');
            $table->string('ben_type');
            $table->string('ben_type_autre')->nullable();
            $table->string('ben_zone');
            $table->string('ben_sexe');
            $table->string('ben_sexe_autre')->nullable();
            $table->string('ben_genre')->nullable();
            $table->string('ben_genre_autre')->nullable();
            $table->string('ben_ethnicite');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('beneficiaires');
    }
};
