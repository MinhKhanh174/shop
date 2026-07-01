<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DemoAuthStore;
use App\Services\DemoUserDataStore;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Throwable;

class AuthController extends Controller
{
    public function register(Request $request, DemoAuthStore $demoAuthStore, DemoUserDataStore $userDataStore)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:6'],
            'firstName' => ['nullable', 'string'],
            'lastName' => ['nullable', 'string'],
            'phone' => ['nullable', 'string'],
            'username' => ['nullable', 'string'],
            'name' => ['nullable', 'string'],
        ]);

        $email = strtolower(trim((string) $validated['email']));

        try {
            $account = $demoAuthStore->saveAccount([
                'email' => $email,
                'password' => (string) $validated['password'],
                'first_name' => $validated['firstName'] ?? '',
                'last_name' => $validated['lastName'] ?? '',
                'phone' => $validated['phone'] ?? '',
                'username' => $validated['username'] ?? '',
                'name' => $validated['name'] ?? '',
            ]);

            return response()->json([
                'ok' => true,
                'message' => 'Đăng ký thành công.',
                'user' => $this->mapDemoAccount($account),
                'cart' => $userDataStore->getCart($email),
                'wishlist' => $userDataStore->getWishlist($email),
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'ok' => false,
                'message' => 'Không thể đăng ký. Vui lòng thử lại sau.',
            ], 500);
        }
    }

    public function login(Request $request, DemoAuthStore $demoAuthStore, DemoUserDataStore $userDataStore)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $email = strtolower(trim((string) $validated['email']));
        $password = (string) $validated['password'];

        try {
            $demoAccount = $demoAuthStore->verifyLogin($email, $password);

            if (!is_array($demoAccount)) {
                return response()->json([
                    'ok' => false,
                    'message' => 'Email hoặc mật khẩu không đúng.',
                ], 422);
            }

            return response()->json([
                'ok' => true,
                'message' => 'Đăng nhập thành công.',
                'token_type' => 'Bearer',
                'accessToken' => Str::random(80),
                'user' => $this->mapDemoAccount($demoAccount),
                'cart' => $userDataStore->getCart($email),
                'wishlist' => $userDataStore->getWishlist($email),
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'ok' => false,
                'message' => 'Không thể đăng nhập. Vui lòng thử lại sau.',
            ], 500);
        }
    }

    public function changePassword(Request $request, DemoAuthStore $demoAuthStore)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'currentPassword' => ['required', 'string'],
            'newPassword' => ['required', 'string', 'min:6'],
            'confirmPassword' => ['required', 'string', 'same:newPassword'],
        ]);

        $email = strtolower(trim((string) $validated['email']));
        $currentPassword = (string) $validated['currentPassword'];
        $newPassword = (string) $validated['newPassword'];

        try {
            $updatedAccount = $demoAuthStore->changePassword($email, $currentPassword, $newPassword);

            if (!is_array($updatedAccount)) {
                return response()->json([
                    'ok' => false,
                    'message' => 'Mật khẩu cũ không đúng.',
                ], 422);
            }

            return response()->json([
                'ok' => true,
                'message' => 'Đổi mật khẩu thành công.',
                'user' => $this->mapDemoAccount($updatedAccount),
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'ok' => false,
                'message' => 'Không thể đổi mật khẩu. Vui lòng thử lại sau.',
            ], 500);
        }
    }

    private function mapDemoAccount(array $account): array
    {
        $email = strtolower(trim((string) ($account['email'] ?? '')));
        $name = trim((string) ($account['name'] ?? ''));
        $firstName = trim((string) ($account['first_name'] ?? ''));
        $lastName = trim((string) ($account['last_name'] ?? ''));
        $username = trim((string) ($account['username'] ?? ''));

        if ($username === '') {
            $username = Str::before($email, '@');
        }

        $fullName = $name !== '' ? $name : trim($lastName . ' ' . $firstName);

        return [
            'id' => $email !== '' ? crc32($email) : null,
            'name' => $fullName,
            'username' => $username !== '' ? $username : $email,
            'firstName' => $firstName,
            'lastName' => $lastName,
            'phone' => trim((string) ($account['phone'] ?? '')),
            'email' => $email,
            'avatar' => trim((string) ($account['avatar'] ?? '')),
            'company' => null,
            'address' => null,
        ];
    }
}
