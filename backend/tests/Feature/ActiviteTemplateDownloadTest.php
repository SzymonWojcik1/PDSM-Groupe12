<?php

namespace Tests\Feature;

use Tests\TestCase;

class ActiviteTemplateDownloadTest extends TestCase
{
    public function test_it_downloads_the_csv_template_file_when_it_exists(): void
    {
        // Prepare the real file
        $filePath = storage_path('app/public/modele_import_activites.csv');
        file_put_contents($filePath, 'Nom;Date début;Date fin');

        // Call the route
        $response = $this->get('/modele-import-activites');

        // Assert successful download
        $response->assertStatus(200);
        $response->assertHeader('content-disposition', 'attachment; filename=modele_import_activites.csv');

        // Clean up
        unlink($filePath);
    }

    public function test_it_returns_404_if_template_file_does_not_exist(): void
    {
        $filePath = storage_path('app/public/modele_import_activites.csv');
        if (file_exists($filePath)) {
            unlink($filePath);
        }

        $response = $this->get('/modele-import-activites');

        $response->assertStatus(404)
                 ->assertJson(['message' => 'Fichier non trouvé']);
    }

    public function test_it_rejects_post_requests(): void
    {
        $response = $this->post('/modele-import-activites');

        $response->assertStatus(405); // Method Not Allowed
    }
}
