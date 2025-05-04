<?php

namespace App\Exports;

use App\Enums\Genre;
use App\Enums\Sexe;
use App\Enums\Type;
use App\Enums\Zone;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\NamedRange;

class BeneficiaireTemplateExport implements FromCollection, WithHeadings, WithEvents
{
    public function collection()
    {
        return collect([
            ['Jean', 'Dupont', '1990-05-14', 'Europe', 'France', 'adult', null, 'urban', 'male', null, 'cis_hetero', null, 'Français']
        ]);
    }

    public function headings(): array
    {
        return [
            'ben_prenom*',
            'ben_nom*',
            'ben_date_naissance*',
            'ben_region*',
            'ben_pays*',
            'ben_type*',
            'ben_type_autre',
            'ben_zone',
            'ben_sexe*',
            'ben_sexe_autre',
            'ben_genre',
            'ben_genre_autre',
            'ben_ethnicite*'
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $spreadsheet = $sheet->getParent();

                $regions = array_keys(config('regions'));
                $pays = collect(config('regions'))->flatten()->unique()->sort()->values()->toArray();
                $genres = array_map(fn($case) => $case->value, Genre::cases());
                $sexes = array_map(fn($case) => $case->value, Sexe::cases());
                $types = array_map(fn($case) => $case->value, Type::cases());
                $zones = array_map(fn($case) => $case->value, Zone::cases());

                $dataSheet = $spreadsheet->createSheet();
                $dataSheet->setTitle('Données');

                foreach ($pays as $i => $country) {
                    $dataSheet->setCellValue("A" . ($i + 1), $country);
                }
                foreach ($regions as $i => $region) {
                    $dataSheet->setCellValue("B" . ($i + 1), $region);
                }

                $dataSheet->setSheetState(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet::SHEETSTATE_HIDDEN);

                $spreadsheet->setActiveSheetIndex(0);

                $spreadsheet->addNamedRange(new NamedRange('ListePays', $dataSheet, "'Données'!\$A\$1:\$A\$" . count($pays)));
                $spreadsheet->addNamedRange(new NamedRange('ListeRegions', $dataSheet, "'Données'!\$B\$1:\$B\$" . count($regions)));

                $sheet->insertNewRowBefore(2, 1);
                $sheet->fromArray([
                    [
                        'Ex: Jean', 'Ex: Dupont', 'Format: YYYY-MM-DD', 'Choisir dans la liste',
                        'Choisir dans la liste', 'Choisir dans la liste', 'Remplir si "other"',
                        'Optionnel', 'Choisir dans la liste', 'Remplir si "other"', 'Choisir dans la liste',
                        'Remplir si "other"', 'Ex: Français'
                    ]
                ], null, 'A2');

                for ($row = 3; $row <= 500; $row++) {
                    $sheet->getStyle("C$row")->getNumberFormat()->setFormatCode('yyyy-mm-dd');

                    foreach (['D' => '=ListeRegions', 'E' => '=ListePays'] as $col => $formula) {
                        $validation = new DataValidation();
                        $validation->setType(DataValidation::TYPE_LIST);
                        $validation->setErrorStyle(DataValidation::STYLE_STOP);
                        $validation->setAllowBlank(false);
                        $validation->setShowInputMessage(true);
                        $validation->setShowErrorMessage(true);
                        $validation->setShowDropDown(true);
                        $validation->setFormula1($formula);
                        $sheet->getCell("$col$row")->setDataValidation(clone $validation);
                    }

                    $inlineValidations = [
                        'F' => $types,
                        'H' => $zones,
                        'I' => $sexes,
                        'K' => $genres,
                    ];

                    foreach ($inlineValidations as $col => $list) {
                        $validation = new DataValidation();
                        $validation->setType(DataValidation::TYPE_LIST);
                        $validation->setErrorStyle(DataValidation::STYLE_STOP);
                        $validation->setAllowBlank(false);
                        $validation->setShowInputMessage(true);
                        $validation->setShowErrorMessage(true);
                        $validation->setShowDropDown(true);
                        $validation->setFormula1('"' . implode(',', $list) . '"');
                        $sheet->getCell("$col$row")->setDataValidation(clone $validation);
                    }
                }
            }
        ];
    }
}