<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ForgotPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $email;
    public string $token;
    public string $resetLink;

    public function __construct(string $email, string $token, string $resetLink)
    {
        $this->email = strtolower(trim($email));
        $this->token = trim($token);
        $this->resetLink = trim($resetLink);
    }

    public function build()
    {
        return $this
            ->subject('TechStore - Yêu cầu đặt lại mật khẩu')
            ->view('emails.forgot-password')
            ->with([
                'email' => $this->email,
                'token' => $this->token,
                'resetLink' => $this->resetLink,
            ]);
    }
}
