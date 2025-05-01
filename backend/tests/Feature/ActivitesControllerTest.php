<?php

namespace Tests\Feature;

use App\Models\Activites;
use App\Models\Partenaire;
use App\Models\Projet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use Carbon\Carbon;

class ActivitesControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function can_list_activities()
    {
        Activites::factory()->count(3)->create();

        $response = $this->getJson('/api/activites');

        $response->assertOk()
            ->assertJsonCount(3);
    }

    /** @test */
    public function can_create_activity()
    {
        $partenaire = Partenaire::factory()->create();
        $projet = Projet::factory()->create();
        $now = Carbon::now()->addDays(5);

        $payload = [
            'act_nom' => 'Nouvelle activité',
            'act_dateDebut' => $now->format('Y-m-d'),
            'act_dateFin' => $now->addDays(2)->format('Y-m-d'),
            'act_part_id' => $partenaire->part_id,
            'act_pro_id' => $projet->pro_id,
        ];

        $response = $this->postJson('/api/activites', $payload);

        $response->assertCreated()
            ->assertJsonFragment(['act_nom' => 'Nouvelle activité']);

        $this->assertDatabaseHas('activites', [
            'act_nom' => 'Nouvelle activité',
        ]);
    }

    /** @test */
    public function can_import_activities_from_csv()
    {
        Storage::fake('local');

        $partenaire = Partenaire::factory()->create(['part_nom' => 'Partenaire Test']);
        $projet = Projet::factory()->create(['pro_nom' => 'Projet Test']);

        $csvContent = "Nom;Début;Fin;Partenaire;Projet\n" .
                      "Atelier Nutrition;2025-06-10;2025-06-15;Partenaire Test;Projet Test\n" .
                      "Activité invalide;;;;\n";

        $file = UploadedFile::fake()->createWithContent('import.csv', $csvContent);

        $response = $this->postJson('/api/activites/import', [
            'file' => $file,
        ]);

        $response->assertStatus(207)
            ->assertJsonFragment(['message' => '1 lignes importées, 1 en erreur.'])
            ->assertJsonStructure(['fichier_erreurs']);

        $this->assertDatabaseHas('activites', [
            'act_nom' => 'Atelier Nutrition',
        ]);
    }

    /** @test */
    public function cannot_import_without_file()
    {
        $response = $this->postJson('/api/activites/import');

        $response->assertStatus(400)
            ->assertJsonFragment(['message' => 'Fichier manquant.']);
    }

    /** @test */
    public function cannot_create_activity_with_missing_fields()
    {
        $response = $this->postJson('/api/activites', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['act_nom', 'act_dateDebut', 'act_dateFin', 'act_part_id', 'act_pro_id']);
    }

    /** @test */
    public function cannot_create_activity_with_past_dates()
    {
        $partenaire = Partenaire::factory()->create();
        $projet = Projet::factory()->create();
        $yesterday = Carbon::yesterday();

        $payload = [
            'act_nom' => 'Activité passée',
            'act_dateDebut' => $yesterday->format('Y-m-d'),
            'act_dateFin' => $yesterday->addDays(1)->format('Y-m-d'),
            'act_part_id' => $partenaire->part_id,
            'act_pro_id' => $projet->pro_id,
        ];

        $response = $this->postJson('/api/activites', $payload);

        $response->assertStatus(400)
            ->assertJsonFragment(['message' => 'Les dates ne peuvent pas être dans le passé.']);
    }

    /** @test */
    public function cannot_create_activity_with_end_date_before_start_date()
    {
        $partenaire = Partenaire::factory()->create();
        $projet = Projet::factory()->create();
        $now = Carbon::now()->addDays(5);

        $payload = [
            'act_nom' => 'Mauvaise date',
            'act_dateDebut' => $now->format('Y-m-d'),
            'act_dateFin' => $now->subDays(2)->format('Y-m-d'),
            'act_part_id' => $partenaire->part_id,
            'act_pro_id' => $projet->pro_id,
        ];

        $response = $this->postJson('/api/activites', $payload);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['act_dateFin']);
    }

    /** @test */
    public function cannot_create_duplicate_activity()
    {
        $activite = Activites::factory()->create();

        $payload = [
            'act_nom' => $activite->act_nom,
            'act_dateDebut' => $activite->act_dateDebut,
            'act_dateFin' => $activite->act_dateFin,
            'act_part_id' => $activite->act_part_id,
            'act_pro_id' => $activite->act_pro_id,
        ];

        $response = $this->postJson('/api/activites', $payload);

        $response->assertStatus(409);
    }

    /** @test */
    public function can_show_activity()
    {
        $activite = Activites::factory()->create();

        $response = $this->getJson("/api/activites/{$activite->act_id}");

        $response->assertOk()
            ->assertJsonFragment(['act_nom' => $activite->act_nom]);
    }

    /** @test */
    public function cannot_show_non_existing_activity()
    {
        $response = $this->getJson('/api/activites/999');

        $response->assertStatus(404)
            ->assertJsonFragment(['message' => 'Activité non trouvée']);
    }

    /** @test */
    public function can_update_activity()
    {
        $activite = Activites::factory()->create();
        $now = Carbon::now()->addDays(10);

        $payload = [
            'act_nom' => 'Activité mise à jour',
            'act_dateDebut' => $now->format('Y-m-d'),
            'act_dateFin' => $now->addDays(3)->format('Y-m-d'),
            'act_part_id' => $activite->act_part_id,
            'act_pro_id' => $activite->act_pro_id,
        ];

        $response = $this->putJson("/api/activites/{$activite->act_id}", $payload);

        $response->assertOk()
            ->assertJsonFragment(['act_nom' => 'Activité mise à jour']);
    }

    /** @test */
    public function cannot_update_started_activity()
    {
        $activite = Activites::factory()->create([
            'act_dateDebut' => Carbon::now()->subDays(2)->format('Y-m-d'),
            'act_dateFin' => Carbon::now()->addDays(2)->format('Y-m-d'),
        ]);

        $payload = [
            'act_nom' => 'Essai modification',
            'act_dateDebut' => Carbon::now()->addDays(10)->format('Y-m-d'),
            'act_dateFin' => Carbon::now()->addDays(12)->format('Y-m-d'),
            'act_part_id' => $activite->act_part_id,
            'act_pro_id' => $activite->act_pro_id,
        ];

        $response = $this->putJson("/api/activites/{$activite->act_id}", $payload);

        $response->assertStatus(403);
    }

    /** @test */
    public function cannot_update_non_existing_activity()
    {
        $partenaire = Partenaire::factory()->create();
        $projet = Projet::factory()->create();
        $now = Carbon::now()->addDays(10);

        $payload = [
            'act_nom' => 'Tentative update',
            'act_dateDebut' => $now->format('Y-m-d'),
            'act_dateFin' => $now->addDays(5)->format('Y-m-d'),
            'act_part_id' => $partenaire->part_id,
            'act_pro_id' => $projet->pro_id,
        ];

        $response = $this->putJson('/api/activites/999', $payload);

        $response->assertStatus(404)
            ->assertJsonFragment(['message' => 'Activité non trouvée']);
    }

    /** @test */
    public function can_delete_activity()
    {
        $activite = Activites::factory()->create();

        $response = $this->deleteJson("/api/activites/{$activite->act_id}");

        $response->assertOk()
            ->assertJson(['message' => 'Activité supprimée']);

        $this->assertDatabaseMissing('activites', [
            'act_id' => $activite->act_id,
        ]);
    }

    /** @test */
    public function cannot_delete_non_existing_activity()
    {
        $response = $this->deleteJson('/api/activites/999');

        $response->assertStatus(404)
            ->assertJsonFragment(['message' => 'Activité non trouvée']);
    }

    /** @test */
    public function cannot_create_activity_with_non_existing_partenaire_or_projet()
    {
        $now = Carbon::now()->addDays(5);

        $payload = [
            'act_nom' => 'Activité test',
            'act_dateDebut' => $now->format('Y-m-d'),
            'act_dateFin' => $now->addDays(2)->format('Y-m-d'),
            'act_part_id' => 9999, // ID inexistant
            'act_pro_id' => 9999,  // ID inexistant
        ];

        $response = $this->postJson('/api/activites', $payload);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['act_part_id', 'act_pro_id']);
    }

    /** @test */
    public function cannot_update_activity_with_invalid_data()
    {
        $activite = Activites::factory()->create();
        $now = Carbon::now()->addDays(10);

        $payload = [
            'act_nom' => '', // Nom vide => invalide
            'act_dateDebut' => $now->format('Y-m-d'),
            'act_dateFin' => $now->addDays(3)->format('Y-m-d'),
            'act_part_id' => $activite->act_part_id,
            'act_pro_id' => $activite->act_pro_id,
        ];

        $response = $this->putJson("/api/activites/{$activite->act_id}", $payload);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['act_nom']);
    }

    /** @test */
    public function cannot_import_activity_with_unknown_partenaire_or_projet()
    {
        Storage::fake('local');

        $csvContent = "Nom;Début;Fin;Partenaire;Projet\n" .
                    "Activité Invalide;2025-08-10;2025-08-15;Inconnu;Inexistant\n";

        $file = UploadedFile::fake()->createWithContent('invalid.csv', $csvContent);

        $response = $this->postJson('/api/activites/import', [
            'file' => $file,
        ]);

        $response->assertStatus(207)
                ->assertJsonFragment(['message' => '0 lignes importées, 1 en erreur.']);
    }

    /** @test */
    public function cannot_import_duplicate_activity()
    {
        Storage::fake('local');

        $partenaire = Partenaire::factory()->create(['part_nom' => 'Doublon']);
        $projet = Projet::factory()->create(['pro_nom' => 'Projet Doublon']);

        // On insère déjà l'activité en BDD
        Activites::create([
            'act_nom' => 'Activité Déjà Là',
            'act_dateDebut' => '2025-09-01',
            'act_dateFin' => '2025-09-03',
            'act_part_id' => $partenaire->part_id,
            'act_pro_id' => $projet->pro_id,
        ]);

        $csvContent = "Nom;Début;Fin;Partenaire;Projet\n" .
                    "Activité Déjà Là;2025-09-01;2025-09-03;Doublon;Projet Doublon\n";

        $file = UploadedFile::fake()->createWithContent('dupe.csv', $csvContent);

        $response = $this->postJson('/api/activites/import', [
            'file' => $file,
        ]);

        $response->assertStatus(207)
                ->assertJsonFragment(['message' => '0 lignes importées, 1 en erreur.']);
    }

    /** @test */
    public function import_detects_too_long_name()
    {
        Storage::fake('local');

        $longName = str_repeat('A', 260);
        $csvContent = "Nom;Début;Fin;Partenaire;Projet\n" .
                    "$longName;2025-10-01;2025-10-03;Invalide;Invalide\n";

        $file = UploadedFile::fake()->createWithContent('long-name.csv', $csvContent);

        $response = $this->postJson('/api/activites/import', [
            'file' => $file,
        ]);

        $response->assertStatus(207)
            ->assertJsonFragment(['message' => '0 lignes importées, 1 en erreur.']);

        $json = $response->json();
        $filePath = str_replace('/storage/', '', parse_url($json['fichier_erreurs'], PHP_URL_PATH));
        $fullPath = storage_path('app/public/' . $filePath);

        $this->assertFileExists($fullPath);

        $content = file_get_contents($fullPath);
        $this->assertStringContainsString('The nom field must not be greater than 255 characters.', $content);
    }

    /** @test */
    public function import_detects_non_string_nom_field()
    {
        Storage::fake('local');

        $csvContent = "Nom;Début;Fin;Partenaire;Projet\n" .
                    "12345;2025-11-01;2025-11-03;Invalide;Invalide\n";

        $file = UploadedFile::fake()->createWithContent('nom-non-string.csv', $csvContent);

        $response = $this->postJson('/api/activites/import', [
            'file' => $file,
        ]);

        $response->assertStatus(207)
            ->assertJsonFragment(['message' => '0 lignes importées, 1 en erreur.']);
    }

    /** @test */
    public function import_detects_invalid_date_format()
    {
        Storage::fake('local');

        $csvContent = "Nom;Début;Fin;Partenaire;Projet\n" .
                    "Activité X;invalid-date;also-invalid;Invalide;Invalide\n";

        $file = UploadedFile::fake()->createWithContent('bad-date.csv', $csvContent);

        $response = $this->postJson('/api/activites/import', [
            'file' => $file,
        ]);

        $response->assertStatus(207)
            ->assertJsonFragment(['message' => '0 lignes importées, 1 en erreur.']);

        $json = $response->json();
        $filePath = str_replace('/storage/', '', parse_url($json['fichier_erreurs'], PHP_URL_PATH));
        $fullPath = storage_path('app/public/' . $filePath);

        $this->assertFileExists($fullPath);

        $content = file_get_contents($fullPath);
        $this->assertStringContainsString('The début field must be a valid date.', $content);
        $this->assertStringContainsString('The fin field must be a valid date.', $content);
    }


    /** @test */
    public function import_detects_multiple_errors_in_one_row()
    {
        Storage::fake('local');

        $csvContent = "Nom;Début;Fin;Partenaire;Projet\n" .
                    ";date-invalide;;;" ;

        $file = UploadedFile::fake()->createWithContent('multi-error.csv', $csvContent);

        $response = $this->postJson('/api/activites/import', [
            'file' => $file,
        ]);

        $response->assertStatus(207)
            ->assertJsonFragment(['message' => '0 lignes importées, 1 en erreur.']);

        $json = $response->json();
        $fileUrl = $json['fichier_erreurs'];
        $filePath = str_replace('/storage/', '', parse_url($fileUrl, PHP_URL_PATH));
        $fullPath = storage_path('app/public/' . $filePath);

        $this->assertFileExists($fullPath);

        $content = file_get_contents($fullPath);
        $this->assertStringContainsString('The nom field is required.', $content);
        $this->assertStringContainsString('The début field must be a valid date.', $content);
        $this->assertStringContainsString('The fin field is required.', $content);
        $this->assertStringContainsString('The partenaire field is required.', $content);
        $this->assertStringContainsString('The projet field is required.', $content);
    }


}
