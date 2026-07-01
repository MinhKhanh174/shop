<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AccountDataController;
use App\Http\Controllers\Api\OrderMailController;
use App\Http\Controllers\Api\PasswordResetController;

Route::get('/test', function () {
    return response()->json(['message' => 'API is TESSTSTT!']);
});

Route::post('/orders/send-mail', [OrderMailController::class, 'send']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
Route::post('/auth/forgot-password', [PasswordResetController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [PasswordResetController::class, 'resetPassword']);
Route::get('/account/cart', [AccountDataController::class, 'getCart']);
Route::post('/account/cart', [AccountDataController::class, 'saveCart']);
Route::get('/account/wishlist', [AccountDataController::class, 'getWishlist']);
Route::post('/account/wishlist', [AccountDataController::class, 'saveWishlist']);
Route::get('/account/addresses', [AccountDataController::class, 'getAddresses']);
Route::post('/account/addresses', [AccountDataController::class, 'saveAddresses']);
