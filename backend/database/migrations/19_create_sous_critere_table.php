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
        Schema::create('sous_critere', function (Blueprint $table) {
            $table->id('sou_id');                      // Clé primaire
            $table->text('sou_texte');                 // Description du sous-critère
            $table->unsignedBigInteger('sou_cri_id');  // Référence au critère

            $table->timestamps();

            // Clé étrangère vers la table critere
            $table->foreign('sou_cri_id')
                  ->references('cri_id')
                  ->on('critere')
                  ->onDelete('cascade'); // Supprime les sous-critères si le critère est supprimé
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sous_critere');
    }
};