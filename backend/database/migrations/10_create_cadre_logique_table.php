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
        Schema::create('cadre_logique', function (Blueprint $table) {
            $table->id('cad_id');                  
            $table->string('cad_nom');             
            $table->date('cad_dateDebut');         
            $table->date('cad_dateFin');           
            $table->timestamps();                  
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cadre_logique');
    }
};