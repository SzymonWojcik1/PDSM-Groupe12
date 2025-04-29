<?php

namespace App\Http\Controllers;

use App\Models\Output;
use Illuminate\Http\Request;

class OutputController extends Controller
{
    public function index()
    {
        return Output::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'opu_nom' => 'required|string',
            'opu_code' => 'required|string|max:20',
            'out_id' => 'required|exists:outcome,out_id',
        ]);

        return response()->json(Output::create($validated), 201);
    }

    public function show($id)
    {
        return Output::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $output = Output::findOrFail($id);

        $validated = $request->validate([
            'opu_nom' => 'sometimes|string',
            'opu_code' => 'sometimes|string|max:20',
            'out_id' => 'sometimes|exists:outcome,out_id',
        ]);

        $output->update($validated);

        return response()->json($output);
    }

    public function destroy($id)
    {
        Output::findOrFail($id)->delete();

        return response()->json(['message' => 'Output supprimé']);
    }
}