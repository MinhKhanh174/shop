<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ForgotPasswordMail;
use App\Services\DemoAuthStore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Throwable;

class PasswordResetController extends Controller
{
    private function buildResetLink(string $email, string $token): string
    {
        $frontendUrl = rtrim((string) config('app.frontend_url'), '/');

        if ($frontendUrl === '') {
            throw new \RuntimeException('FRONTEND_URL is not configured.');
        }

        return $frontendUrl . '/reset-password?' . http_build_query([
            'email' => strtolower(trim($email)),
            'token' => $token,
        ]);
    }

    public function forgotPassword(Request $request, DemoAuthStore $demoAuthStore)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $email = strtolower(trim((string) $validated['email']));

        try {
            $token = Str::random(64);
            $resetLink = $this->buildResetLink($email, $token);

            $demoAuthStore->storeResetToken($email, $token, 60);

            Mail::to($email)->send(new ForgotPasswordMail($email, $token, $resetLink));

            $payload = [
                'ok' => true,
                'mode' => 'mailtrap_test',
                'message' => 'Vui lòng xác nhận qua email để tiếp tục.',
            ];

            if (app()->environment(['local', 'testing'])) {
                $payload['token'] = $token;
                $payload['resetLink'] = $resetLink;
            }

            return response()->json($payload);
        } catch (Throwable $exception) {
            report($exception);

            $message = $exception instanceof \RuntimeException
                ? $exception->getMessage()
                : 'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.';

            return response()->json([
                'ok' => false,
                'message' => $message,
            ], 500);
        }
    }

    public function resetPassword(Request $request, DemoAuthStore $demoAuthStore)
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $email = strtolower(trim((string) $validated['email']));
        $token = trim((string) $validated['token']);
        $password = (string) $validated['password'];

        try {
            if (!$demoAuthStore->consumeResetToken($email, $token)) {
                return response()->json([
                    'ok' => false,
                    'message' => 'Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.',
                    'status' => 'invalid_token',
                ], 410);
            }

            $demoAuthStore->updatePassword($email, $password);

            return response()->json([
                'ok' => true,
                'mode' => 'normal',
                'message' => 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.',
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'ok' => false,
                'message' => 'Không thể đặt lại mật khẩu. Vui lòng thử lại sau.',
            ], 500);
        }
    }
}
