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
    // Returns all enum values and their translated labels for the frontend
    public function enums(Request $request)
    {
        // Get the locale from the query string, default to 'en'
        $locale = $request->query('locale', 'en');
        App::setLocale($locale);

        // Return all enums as arrays of value/label pairs
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
            'role' => collect(\App\Enums\Role::cases())->map(fn($e) => [
                'value' => $e->value,
                'label' => __("role.{$e->value}"),
            ]),
        ]);
    }

}