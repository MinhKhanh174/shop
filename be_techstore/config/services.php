<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'demo_auth' => [
        // Demo credentials are for local/demo only. Do not enable in production.
        'enabled' => env('DEMO_AUTH_ENABLED', env('APP_ENV', 'production') !== 'production'),
        'admin_email' => env('DEMO_AUTH_ADMIN_EMAIL', 'admin@techstore.test'),
        'admin_password' => env('DEMO_AUTH_ADMIN_PASSWORD', '123456'),
    ],

];
