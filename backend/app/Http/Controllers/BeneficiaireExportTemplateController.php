<?php
namespace App\Http\Controllers;

use App\Exports\BeneficiaireTemplateExport;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Excel as ExcelFormat;

class BeneficiaireExportTemplateController extends Controller
{
  public function downloadTemplate()
  {
    return Excel::download(
        new BeneficiaireTemplateExport,
        'template_beneficiaires.xlsx',
        ExcelFormat::XLSX
    );
  }
}