<?php
namespace App\Http\Controllers;

use App\Exports\BeneficiaireTemplateExport;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Excel as ExcelFormat;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use App\Helpers\Logger;

class BeneficiaireExportTemplateController extends Controller
{
    // Downloads the beneficiary Excel template using the BeneficiaireTemplateExport export class

    public function downloadTemplate()
    {
        Logger::log(
            'info',
            'Téléchargement modèle bénéficiaire',
            'Un utilisateur a téléchargé le fichier Excel modèle pour les bénéficiaires',
            [],
            auth()->id()
        );

        // Génère la réponse du fichier Excel
        $response = Excel::download(
            new BeneficiaireTemplateExport,
            'template_beneficiaires.xlsx',
            ExcelFormat::XLSX
        );

        // Injecte les headers CORS + Content-Disposition exposé
        $response->headers->set('Access-Control-Allow-Origin', '*');
        $response->headers->set('Access-Control-Expose-Headers', 'Content-Disposition');

        return $response;
    }
}