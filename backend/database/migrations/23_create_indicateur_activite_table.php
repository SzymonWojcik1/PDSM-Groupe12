<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activite_indicateur', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('act_id');
            $table->unsignedBigInteger('ind_id');
            $table->timestamps();

            $table->foreign('act_id')->references('act_id')->on('activites')->onDelete('cascade');
            $table->foreign('ind_id')->references('ind_id')->on('indicateur')->onDelete('cascade');

            $table->unique(['act_id', 'ind_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activite_indicateur');
    }
};
