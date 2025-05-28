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
        // Create the 'beneficiaires' table with all required columns
        Schema::create('beneficiaires', function (Blueprint $table) {
            // Primary key
            $table->id('ben_id');
            // First name
            $table->string('ben_prenom');
            // Last name
            $table->string('ben_nom');
            // Date of birth
            $table->date('ben_date_naissance');
            // Region
            $table->string('ben_region');
            // Country
            $table->string('ben_pays');
            // Type (enum as string)
            $table->string('ben_type');
            // Type (other) - nullable
            $table->string('ben_type_autre')->nullable();
            // Zone (enum as string)
            $table->string('ben_zone');
            // Sex (enum as string)
            $table->string('ben_sexe');
            // Sex (other) - nullable
            $table->string('ben_sexe_autre')->nullable();
            // Gender (enum as string) - nullable
            $table->string('ben_genre')->nullable();
            // Gender (other) - nullable
            $table->string('ben_genre_autre')->nullable();
            // Ethnicity
            $table->string('ben_ethnicite');
            // Timestamps (created_at, updated_at)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the 'beneficiaires' table if it exists
        Schema::dropIfExists('beneficiaires');
    }
};
