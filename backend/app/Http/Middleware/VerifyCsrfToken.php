<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * Indicates whether the XSRF-TOKEN cookie should be set on the response.
     */
    protected $addHttpCookie = true;

    /**
     * The URIs that should be excluded from CSRF verification.
     */
    protected $except = [
        'api/*',             // exclut toutes les routes de l'API
        'login',             // utile si tu appelles /login directement
        'logout',
        'me',
    ];
}
