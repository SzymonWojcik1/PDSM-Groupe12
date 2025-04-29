<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('indicateur', function (Blueprint $table) {
            $table->id('ind_id');
            $table->enum('ind_type', ['outcome', 'output']);
            $table->string('ind_reference', 50);
            $table->text('ind_nom');
            $table->integer('ind_valeurCible2028');

            $table->unsignedBigInteger('out_id')->nullable();
            $table->unsignedBigInteger('opu_id')->nullable();
            $table->timestamps();

            $table->foreign('out_id')->references('out_id')->on('outcome')->onDelete('cascade');
            $table->foreign('opu_id')->references('opu_id')->on('output')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('indicateur');
    }
};