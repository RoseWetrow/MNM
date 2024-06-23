<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\NewsController;

Route::get('/news_all', [NewsController::class, 'getNewsAll']);
Route::get('/news_weekly', [NewsController::class, 'getNewsWeekly']);
Route::get('/news_today', [NewsController::class, 'getNewsToday']);



Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');