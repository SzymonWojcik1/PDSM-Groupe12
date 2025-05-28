<?php

namespace App\Http\Controllers;

use App\Models\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LogController extends Controller
{
    public function index()
    {
        // Allow access only to users with the "siege" role
        if (Auth::user()?->role !== 'siege') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Return logs ordered by newest first
        return Log::orderBy('created_at', 'desc')->get();
    }
}
