<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/news_all', 'App\Http\Controllers\NewsController@getNewsAll');
Route::get('/news_weekly', 'App\Http\Controllers\NewsController@getNewsWeekly');
