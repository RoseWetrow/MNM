<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\Request;
use Carbon\Carbon;

class NewsController extends Controller
{
    // Все новости
    public function getNewsAll(){
        return response()->json(News::get(), 200);
    }

    // Метод для получения новостей за последнюю неделю
    public function getNewsWeekly(){
        $oneWeekAgo = Carbon::now()->subWeek()->timestamp;
        
        $news = News::where('date_unix', '>=', $oneWeekAgo)->get();

        return response()->json($news, 200);
    }

}
