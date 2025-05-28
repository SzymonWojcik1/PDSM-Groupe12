<?php
namespace App\Http\Controllers;

use App\Exports\BeneficiaireTemplateExport;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Excel as ExcelFormat;
use App\Helpers\Logger;

class BeneficiaireExportTemplateController extends Controller
{
  public function downloadTemplate()
  {

    // Log
    Logger::log(
        'info',
        'Téléchargement modèle bénéficiaire',
        'Un utilisateur a téléchargé le fichier Excel modèle pour les bénéficiaires',
        [],
        auth()->id()
    );
    return Excel::download(
        new BeneficiaireTemplateExport,
        'template_beneficiaires.xlsx',
        ExcelFormat::XLSX
    );
  }
}