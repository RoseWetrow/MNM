<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Http\Controllers\NewsController;

class News extends Model
{
    use HasFactory;

    protected $table = 'public.news';

    protected $fillable = [
        'title',
        'description',
        'date_unix',
        'link',
        'type',
        'image',
        'area',
        'district',
        'lng',
        'lat',
        'source',
        'date'
    ];

}
