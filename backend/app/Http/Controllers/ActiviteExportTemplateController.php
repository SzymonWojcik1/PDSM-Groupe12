<?php

namespace App\Http\Controllers;

use App\Exports\ActivitesTemplateExport;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Excel as ExcelFormat;
use App\Helpers\Logger;

class ActiviteExportTemplateController extends Controller
{
    public function downloadTemplate()
    {
        // Log
        Logger::log(
            'info',
            'Téléchargement modèle activité',
            'Un utilisateur a téléchargé le fichier Excel modèle pour les activités',
            [],
            auth()->id()
        );

        return Excel::download(
            new ActivitesTemplateExport(),
            'template_activites.xlsx',
            ExcelFormat::XLSX
        );
    }
}
