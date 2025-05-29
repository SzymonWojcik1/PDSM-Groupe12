<?php

return [

    'paths' => ['api/*', 'login', 'logout', 'me', 'beneficiaires/template', 'activites/template' , 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
