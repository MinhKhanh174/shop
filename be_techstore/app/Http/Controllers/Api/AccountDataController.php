<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DemoUserDataStore;
use Illuminate\Http\Request;
use Throwable;

class AccountDataController extends Controller
{
    public function getCart(Request $request, DemoUserDataStore $store)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        try {
            $email = strtolower(trim((string) $validated['email']));

            return response()->json([
                'ok' => true,
                'items' => $store->getCart($email),
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'ok' => false,
                'message' => 'Không thể tải giỏ hàng.',
                'items' => [],
            ], 500);
        }
    }

    public function saveCart(Request $request, DemoUserDataStore $store)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'items' => ['required', 'array'],
        ]);

        try {
            $email = strtolower(trim((string) $validated['email']));
            $items = $validated['items'];

            return response()->json([
                'ok' => true,
                'items' => $store->saveCart($email, $items),
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'ok' => false,
                'message' => 'Không thể lưu giỏ hàng.',
                'items' => [],
            ], 500);
        }
    }

    public function getWishlist(Request $request, DemoUserDataStore $store)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        try {
            $email = strtolower(trim((string) $validated['email']));

            return response()->json([
                'ok' => true,
                'items' => $store->getWishlist($email),
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'ok' => false,
                'message' => 'Không thể tải danh sách yêu thích.',
                'items' => [],
            ], 500);
        }
    }

    public function saveWishlist(Request $request, DemoUserDataStore $store)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'items' => ['required', 'array'],
        ]);

        try {
            $email = strtolower(trim((string) $validated['email']));
            $items = $validated['items'];

            return response()->json([
                'ok' => true,
                'items' => $store->saveWishlist($email, $items),
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'ok' => false,
                'message' => 'Không thể lưu danh sách yêu thích.',
                'items' => [],
            ], 500);
        }
    }

    public function getAddresses(Request $request, DemoUserDataStore $store)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        try {
            $email = strtolower(trim((string) $validated['email']));

            return response()->json([
                'ok' => true,
                'items' => $store->getAddresses($email),
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'ok' => false,
                'message' => 'Không thể tải sổ địa chỉ.',
                'items' => [],
            ], 500);
        }
    }

    public function saveAddresses(Request $request, DemoUserDataStore $store)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'items' => ['required', 'array'],
        ]);

        try {
            $email = strtolower(trim((string) $validated['email']));
            $items = $validated['items'];

            return response()->json([
                'ok' => true,
                'items' => $store->saveAddresses($email, $items),
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'ok' => false,
                'message' => 'Không thể lưu sổ địa chỉ.',
                'items' => [],
            ], 500);
        }
    }
}
