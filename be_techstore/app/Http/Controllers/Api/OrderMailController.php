<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OrderPlacedMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Throwable;

class OrderMailController extends Controller
{
    public function send(Request $request)
    {
        $validated = $request->validate([
            'order' => ['required', 'array'],
            'order.id' => ['required', 'string'],
            'order.customer' => ['required', 'array'],
            'order.customer.email' => ['required', 'email'],
            'order.customer.fullName' => ['nullable', 'string'],
            'order.customer.phone' => ['nullable', 'string'],
            'order.address' => ['nullable', 'string'],
            'order.paymentMethod' => ['nullable', 'string'],
            'order.subtotal' => ['nullable', 'numeric'],
            'order.shippingFee' => ['nullable', 'numeric'],
            'order.discount' => ['nullable', 'numeric'],
            'order.grandTotal' => ['nullable', 'numeric'],
            'order.items' => ['nullable', 'array'],
        ]);

        $order = $validated['order'];
        $email = data_get($order, 'customer.email');

        try {
            Mail::to($email)->send(new OrderPlacedMail($order));

            return response()->json([
                'ok' => true,
                'message' => 'Email order confirmation sent successfully.',
                'provider' => 'smtp',
                'recipient' => $email,
                'orderId' => data_get($order, 'id'),
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'ok' => false,
                'message' => $exception->getMessage(),
                'recipient' => $email,
                'orderId' => data_get($order, 'id'),
            ], 500);
        }
    }
}
