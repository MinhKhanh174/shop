<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class DemoUserDataStore
{
    private const CART_PREFIX = 'demo-user-data:cart:';
    private const WISHLIST_PREFIX = 'demo-user-data:wishlist:';
    private const ADDRESS_PREFIX = 'demo-user-data:address:';

    private function normalizeEmail(string $email): string
    {
        return strtolower(trim($email));
    }

    private function scope(string $email): string
    {
        return $this->normalizeEmail($email);
    }

    private function cartKey(string $email): string
    {
        return self::CART_PREFIX . $this->scope($email);
    }

    private function wishlistKey(string $email): string
    {
        return self::WISHLIST_PREFIX . $this->scope($email);
    }

    private function addressKey(string $email): string
    {
        return self::ADDRESS_PREFIX . $this->scope($email);
    }

    private function normalizeItems($items): array
    {
        if (!is_array($items)) {
            return [];
        }

        return array_values(array_filter($items, static fn ($item) => is_array($item) || is_object($item)));
    }

    public function getCart(string $email): array
    {
        $cart = Cache::get($this->cartKey($email), []);

        return $this->normalizeItems($cart);
    }

    public function saveCart(string $email, array $items): array
    {
        $normalized = $this->normalizeItems($items);
        Cache::forever($this->cartKey($email), $normalized);

        return $normalized;
    }

    public function getWishlist(string $email): array
    {
        $wishlist = Cache::get($this->wishlistKey($email), []);

        return $this->normalizeItems($wishlist);
    }

    public function saveWishlist(string $email, array $items): array
    {
        $normalized = $this->normalizeItems($items);
        Cache::forever($this->wishlistKey($email), $normalized);

        return $normalized;
    }

    public function getAddresses(string $email): array
    {
        $addresses = Cache::get($this->addressKey($email), []);

        return $this->normalizeItems($addresses);
    }

    public function saveAddresses(string $email, array $items): array
    {
        $normalized = $this->normalizeItems($items);
        Cache::forever($this->addressKey($email), $normalized);

        return $normalized;
    }
}
