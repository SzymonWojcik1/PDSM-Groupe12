<?php

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::get('/users', function () {
    return UserResource::collection(resource: User::all());
});
