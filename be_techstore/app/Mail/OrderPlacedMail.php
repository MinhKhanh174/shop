<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderPlacedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $order;

    public function __construct(array $order)
    {
        $this->order = $order;
    }

    public function build()
    {
        $orderId = data_get($this->order, 'id', 'unknown');

        return $this
            ->subject('THÔNG BÁO ĐƠN HÀNG | Xác nhận đơn hàng #' . $orderId)
            ->view('emails.order-placed')
            ->with([
                'order' => $this->order,
            ]);
    }
}
