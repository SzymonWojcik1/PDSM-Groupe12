<?php

namespace App\Http\Controllers;

use App\Models\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LogController extends Controller
{
    public function index()
    {
        // Vérifie que seul le rôle "siege" peut accéder
        if (Auth::user()?->role !== 'siege') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        return Log::orderBy('created_at', 'desc')->get();
    }
}
