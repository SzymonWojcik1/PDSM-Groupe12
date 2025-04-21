<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\App;
use Illuminate\Http\Request;
use App\Enums\Type;
use App\Enums\Zone;
use App\Enums\Sexe;
use App\Enums\Genre;

class EnumController extends Controller
{
    public function enums(Request $request)
    {
        $locale = $request->query('locale', 'en'); // par défaut 'en'
        App::setLocale($locale);

        return response()->json([
            'type' => collect(\App\Enums\Type::cases())->map(fn($e) => [
                'value' => $e->value,
                'label' => __("type.{$e->value}"),
            ]),
            'zone' => collect(\App\Enums\Zone::cases())->map(fn($e) => [
                'value' => $e->value,
                'label' => __("zone.{$e->value}"),
            ]),
            'sexe' => collect(\App\Enums\Sexe::cases())->map(fn($e) => [
                'value' => $e->value,
                'label' => __("sexe.{$e->value}"),
            ]),
            'genre' => collect(\App\Enums\Genre::cases())->map(fn($e) => [
                'value' => $e->value,
                'label' => __("genre.{$e->value}"),
            ]),
        ]);
    }

}