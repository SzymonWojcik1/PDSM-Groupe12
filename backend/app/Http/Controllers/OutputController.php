<?php

namespace App\Http\Controllers;

use App\Models\Output;
use Illuminate\Http\Request;
use App\Helpers\Logger;

class OutputController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $query = Output::query();
        if ($request->has('out_id')) {
            $query->where('out_id', $request->input('out_id'));
        }
        return $query->get();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'opu_nom' => 'required|string',
            'opu_code' => 'required|string|max:20',
            'out_id' => 'required|exists:outcome,out_id',
        ]);

        $output = Output::create($validated);

        Logger::log(
            'info',
            'Création output',
            'Un nouvel output a été créé.',
            ['id' => $output->opu_id, 'nom' => $output->opu_nom, 'code' => $output->opu_code],
            auth()->id()
        );

        return response()->json($output, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return Output::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $output = Output::findOrFail($id);

        $validated = $request->validate([
            'opu_nom' => 'sometimes|string',
            'opu_code' => 'sometimes|string|max:20',
            'out_id' => 'sometimes|exists:outcome,out_id',
        ]);

        $output->update($validated);

        Logger::log(
            'info',
            'Mise à jour output',
            'Un output a été mis à jour.',
            ['id' => $output->opu_id, 'nom' => $output->opu_nom],
            auth()->id()
        );

        return response()->json($output);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $output = Output::findOrFail($id);
        $output->delete();

        Logger::log(
            'info',
            'Suppression output',
            'Un output a été supprimé.',
            ['id' => $output->opu_id, 'nom' => $output->opu_nom],
            auth()->id()
        );

        return response()->json(['message' => 'Output supprimé']);
    }
}
