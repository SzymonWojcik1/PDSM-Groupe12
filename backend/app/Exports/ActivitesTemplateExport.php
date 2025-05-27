<?php

namespace App\Exports;

use App\Models\Partenaire;
use App\Models\Projet;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\NamedRange;

class ActivitesTemplateExport implements FromCollection, WithHeadings, WithEvents
{
    public function collection()
    {
        return collect([
            ['Ex: Sensibilisation numérique', '2025-10-01', '2025-10-05', 'Nom du partenaire', 'Nom du projet']
        ]);
    }

    public function headings(): array
    {
        return [
            'Nom de l’activité',
            'Date de début',
            'Date de fin',
            'Partenaire',
            'Projet'
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $spreadsheet = $sheet->getParent();

                $partenaires = Partenaire::orderBy('part_nom')->get(['part_id', 'part_nom']);
                $projets = Projet::orderBy('pro_nom')->get(['pro_id', 'pro_nom']);

                $dataSheet = $spreadsheet->createSheet();
                $dataSheet->setTitle('Données');

                // Insérer partenaires dans colonne A
                foreach ($partenaires as $i => $p) {
                    $dataSheet->setCellValue("A" . ($i + 1), $p->part_nom);
                }

                // Insérer projets dans colonne B
                foreach ($projets as $i => $p) {
                    $dataSheet->setCellValue("B" . ($i + 1), $p->pro_nom);
                }

                $spreadsheet->addNamedRange(new NamedRange(
                    'ListePartenaires',
                    $dataSheet,
                    "'Données'!\$A\$1:\$A\$" . count($partenaires)
                ));
                $spreadsheet->addNamedRange(new NamedRange(
                    'ListeProjets',
                    $dataSheet,
                    "'Données'!\$B\$1:\$B\$" . count($projets)
                ));

                // Masquer feuille des données
                $dataSheet->setSheetState(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::SHEETSTATE_HIDDEN);
                $spreadsheet->setActiveSheetIndex(0);

                // Ajouter validation de données
                for ($row = 3; $row <= 500; $row++) {
                    // Format date pour colonnes B et C
                    foreach (['B', 'C'] as $col) {
                        $sheet->getStyle("$col$row")->getNumberFormat()->setFormatCode('yyyy-mm-dd');
                    }

                    // Validation liste pour partenaire (colonne D)
                    $validationPartenaire = new DataValidation();
                    $validationPartenaire->setType(DataValidation::TYPE_LIST);
                    $validationPartenaire->setErrorStyle(DataValidation::STYLE_STOP);
                    $validationPartenaire->setAllowBlank(false);
                    $validationPartenaire->setShowDropDown(true);
                    $validationPartenaire->setFormula1('=ListePartenaires');
                    $sheet->getCell("D$row")->setDataValidation(clone $validationPartenaire);

                    // Validation liste pour projet (colonne E)
                    $validationProjet = new DataValidation();
                    $validationProjet->setType(DataValidation::TYPE_LIST);
                    $validationProjet->setErrorStyle(DataValidation::STYLE_STOP);
                    $validationProjet->setAllowBlank(false);
                    $validationProjet->setShowDropDown(true);
                    $validationProjet->setFormula1('=ListeProjets');
                    $sheet->getCell("E$row")->setDataValidation(clone $validationProjet);
                }

                // Ligne d'exemple explicative
                $sheet->insertNewRowBefore(2, 1);
                $sheet->fromArray([
                    [
                        'Ex: Sensibilisation numérique',
                        'Format: YYYY-MM-DD',
                        'Format: YYYY-MM-DD',
                        'Choisir un partenaire',
                        'Choisir un projet'
                    ]
                ], null, 'A2');
            }
        ];
    }
}
