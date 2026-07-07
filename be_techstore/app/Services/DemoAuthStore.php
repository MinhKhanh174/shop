<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoAuthStore
{
    private const ACCOUNT_PREFIX = 'demo-auth:account:';
    private const RESET_PREFIX = 'demo-auth:reset:';

    public function isEnabled(): bool
    {
        return (bool) config('services.demo_auth.enabled', false);
    }

    public function disabledMessage(): string
    {
        return 'Demo auth is disabled. Please configure real auth provider.';
    }

    private function adminEmail(): string
    {
        return strtolower(trim((string) config('services.demo_auth.admin_email', 'admin@techstore.test')));
    }

    private function adminPassword(): string
    {
        return (string) config('services.demo_auth.admin_password', '123456');
    }

    private function normalizeEmail(string $email): string
    {
        return strtolower(trim($email));
    }

    private function accountKey(string $email): string
    {
        return self::ACCOUNT_PREFIX . $this->normalizeEmail($email);
    }

    private function resetKey(string $email): string
    {
        return self::RESET_PREFIX . $this->normalizeEmail($email);
    }

    public function findAccount(string $email): ?array
    {
        if (!$this->isEnabled()) {
            return null;
        }

        $account = Cache::get($this->accountKey($email));

        if (is_array($account)) {
            return $account;
        }

        if ($this->normalizeEmail($email) === $this->adminEmail()) {
            return $this->makeAdminAccount();
        }

        return null;
    }

    public function saveAccount(array $payload): array
    {
        if (!$this->isEnabled()) {
            throw new \RuntimeException($this->disabledMessage());
        }

        $email = $this->normalizeEmail((string) ($payload['email'] ?? ''));
        $password = (string) ($payload['password'] ?? '');
        $role = $this->normalizeRole($payload['role'] ?? ($email === $this->adminEmail() ? 'admin' : 'customer'));

        $account = [
            'email' => $email,
            'name' => trim((string) ($payload['name'] ?? '')),
            'username' => trim((string) ($payload['username'] ?? Str::before($email, '@'))),
            'first_name' => trim((string) ($payload['first_name'] ?? $payload['firstName'] ?? '')),
            'last_name' => trim((string) ($payload['last_name'] ?? $payload['lastName'] ?? '')),
            'phone' => trim((string) ($payload['phone'] ?? '')),
            'avatar' => trim((string) ($payload['avatar'] ?? '')),
            'role' => $role,
            'password_hash' => Hash::make($password),
            'updated_at' => now()->toIso8601String(),
        ];

        if ($account['name'] === '' && ($account['first_name'] !== '' || $account['last_name'] !== '')) {
            $account['name'] = trim($account['last_name'] . ' ' . $account['first_name']);
        }

        Cache::forever($this->accountKey($email), $account);

        return $account;
    }

    public function verifyLogin(string $email, string $password): ?array
    {
        if (!$this->isEnabled()) {
            return null;
        }

        $account = $this->findAccount($email);

        if (!$account || empty($account['password_hash'])) {
            return null;
        }

        if (!Hash::check($password, (string) $account['password_hash'])) {
            return null;
        }

        return $account;
    }

    public function updatePassword(string $email, string $password): ?array
    {
        if (!$this->isEnabled()) {
            return null;
        }

        $account = $this->findAccount($email);

        if (!$account) {
            $account = [
                'email' => $this->normalizeEmail($email),
                'name' => '',
                'username' => trim((string) Str::before($this->normalizeEmail($email), '@')),
                'first_name' => '',
                'last_name' => '',
                'phone' => '',
                'avatar' => '',
                'role' => $this->normalizeEmail($email) === $this->adminEmail() ? 'admin' : 'customer',
            ];
        }

        $account['password_hash'] = Hash::make($password);
        $account['updated_at'] = now()->toIso8601String();

        Cache::forever($this->accountKey($email), $account);

        return $account;
    }

    public function changePassword(string $email, string $currentPassword, string $newPassword): ?array
    {
        $account = $this->verifyLogin($email, $currentPassword);

        if (!$account) {
            return null;
        }

        return $this->updatePassword($email, $newPassword);
    }

    public function storeResetToken(string $email, string $token, int $minutes = 60): void
    {
        Cache::put($this->resetKey($email), [
            'email' => $this->normalizeEmail($email),
            'token' => $token,
            'created_at' => now()->toIso8601String(),
        ], now()->addMinutes($minutes));
    }

    public function consumeResetToken(string $email, string $token): bool
    {
        if (!$this->isEnabled()) {
            return false;
        }

        $cached = Cache::get($this->resetKey($email));

        if (!is_array($cached) || empty($cached['token'])) {
            return false;
        }

        $isValid = hash_equals((string) $cached['token'], (string) $token);

        if ($isValid) {
            Cache::forget($this->resetKey($email));
        }

        return $isValid;
    }

    public function hasAccount(string $email): bool
    {
        if (!$this->isEnabled()) {
            return false;
        }

        if ($this->normalizeEmail($email) === $this->adminEmail()) {
            return true;
        }

        return Cache::has($this->accountKey($email));
    }

    private function normalizeRole($role): string
    {
        return strtolower(trim((string) $role)) === 'admin' ? 'admin' : 'customer';
    }

    private function makeAdminAccount(): array
    {
        return [
            'email' => $this->adminEmail(),
            'name' => 'TechStore Admin',
            'username' => 'admin',
            'first_name' => 'TechStore',
            'last_name' => 'Admin',
            'phone' => '',
            'avatar' => '',
            'role' => 'admin',
            'password_hash' => Hash::make($this->adminPassword()),
            'updated_at' => now()->toIso8601String(),
        ];
    }
}
