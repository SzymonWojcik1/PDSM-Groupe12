<?php

namespace App\Http\Controllers;

use App\Exports\ActivitesTemplateExport;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Excel as ExcelFormat;
use App\Helpers\Logger;

/**
 * Controller for handling activity template exports
 * Provides functionality to download Excel templates for activities
 * Used for standardizing activity data import formats
 */
class ActiviteExportTemplateController extends Controller
{
    /**
     * Download the Excel template for activities
     * 
     * This method:
     * 1. Logs the download action
     * 2. Generates and returns an Excel file containing the template structure
     * 
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     * The Excel template file for download
     */
    public function downloadTemplate()
    {
        // Log the template download action
        Logger::log(
            'info',
            'Téléchargement modèle activité',
            'Un utilisateur a téléchargé le fichier Excel modèle pour les activités',
            [],
            auth()->id()
        );

        // Generate and return the Excel template
        return Excel::download(
            new ActivitesTemplateExport(),
            'template_activites.xlsx',
            ExcelFormat::XLSX
        );
    }
}
