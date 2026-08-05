<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsStaff
{
    /**
     * Ensure the authenticated user is store staff (super admin or employee).
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null || ! $user->isStaff()) {
            abort(403, 'You do not have access to the store admin.');
        }

        return $next($request);
    }
}
