<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Partenaire;
use App\Models\Projet;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use App\Models\Activites;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ActivitesImportControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Create a test spreadsheet with the given rows.
     */
    protected function createSpreadsheet(array $rows): UploadedFile
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        foreach ($rows as $i => $row) {
            $col = 'A';
            foreach ($row as $value) {
                $sheet->setCellValue($col . ($i + 1), $value);
                $col++;
            }
        }

        $filePath = storage_path('app/test_import.xlsx');
        (new Xlsx($spreadsheet))->save($filePath);

        return new UploadedFile($filePath, 'test_import.xlsx', null, null, true);
    }

    /**
     * Authenticate a user for the tests.
     */
    protected function authenticate()
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        return $user;
    }

    /**
     * Test importing valid activities data creates records in the database.
     */
    public function test_import_with_invalid_data_returns_csv_error_file()
    {
        $this->authenticate();

        // No partenaire or project exists
        $rows = [
            ['Nom', 'Date Début', 'Date Fin', 'Partenaire', 'Projet'],
            ['Exemple', '', '', '', ''],
            ['Activité A', '', '2025-06-01', 'Partenaire Inconnu', 'Projet Inconnu'],
        ];

        $file = $this->createSpreadsheet($rows);

        $response = $this->post('/api/activites/import', ['file' => $file]);
        $response->assertStatus(200);
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
    }
}
