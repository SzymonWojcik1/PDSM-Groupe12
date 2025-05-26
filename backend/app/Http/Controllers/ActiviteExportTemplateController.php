<?php

namespace App\Http\Controllers;

use App\Exports\ActivitesTemplateExport;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Excel as ExcelFormat;

class ActiviteExportTemplateController extends Controller
{
    public function downloadTemplate()
    {
        return Excel::download(
            new ActivitesTemplateExport(),
            'template_activites.xlsx',
            ExcelFormat::XLSX
        );
    }
}
