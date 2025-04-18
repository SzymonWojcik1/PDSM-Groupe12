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
            $table->id();
            $table->string('prenom');
            $table->string('nom');
            $table->date('date_naissance');
            $table->string('region');
            $table->string('pays');
            $table->string('type');
            $table->string('type_autre')->nullable();
            $table->string('zone');
            $table->string('sexe');
            $table->string('sexe_autre')->nullable();
            $table->string('genre')->nullable();
            $table->string('genre_autre')->nullable();
            $table->string('ethnicite');
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
