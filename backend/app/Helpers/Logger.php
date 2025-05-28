<?php

namespace App\Helpers;

use App\Models\Log;

class Logger
{
    public static function log(string $level, string $action, ?string $message = null, array $context = [], ?int $userId = null)
    {
        $logUserId = $userId
            ?? request('user_id')
            ?? request()->header('X-User-ID');

        Log::create([
            'user_id' => $logUserId,
            'level' => $level,
            'action' => $action,
            'message' => $message,
            'context' => !empty($context) ? json_encode($context, JSON_UNESCAPED_UNICODE) : null,
        ]);
    }
}
