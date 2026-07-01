@php
    $brandName = config('app.name', 'TechStore');
@endphp
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TechStore - Yêu cầu đặt lại mật khẩu</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #f4f4f5;
            font-family: Arial, Helvetica, sans-serif;
            color: #202124;
        }
        .wrap {
            width: 100%;
            padding: 24px 12px;
            box-sizing: border-box;
        }
        .card {
            width: 100%;
            max-width: 640px;
            margin: 0 auto;
            background: #fff;
            border: 1px solid #e5e7eb;
            box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(180deg, #ef1d16 0%, #d91b15 100%);
            color: #fff;
            text-align: center;
            padding: 28px 24px 26px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            line-height: 1.25;
        }
        .content {
            padding: 28px;
        }
        .text {
            margin: 0 0 14px;
            font-size: 15px;
            line-height: 1.7;
        }
        .note {
            margin: 0 0 22px;
            font-size: 13px;
            line-height: 1.6;
            color: #6b7280;
        }
        .cta-wrap {
            text-align: center;
            margin: 0 0 18px;
        }
        .cta {
            display: inline-block;
            background: #ef1d16;
            color: #fff !important;
            text-decoration: none;
            border-radius: 4px;
            padding: 13px 24px;
            font-size: 14px;
            font-weight: 700;
        }
        .plain-link {
            word-break: break-all;
            font-size: 12px;
            line-height: 1.6;
            color: #6b7280;
            text-align: center;
            margin: 0;
        }
        .footer {
            text-align: center;
            padding: 18px 24px 24px;
            background: #f8fafc;
            color: #6b7280;
            font-size: 12px;
            line-height: 1.6;
        }
        @media only screen and (max-width: 640px) {
            .content {
                padding: 22px 18px 24px;
            }
            .header h1 {
                font-size: 21px;
            }
        }
    </style>
</head>
<body>
    <div class="wrap">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
                <td align="center">
                    <table role="presentation" class="card" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                            <td class="header">
                                <h1>Yêu cầu đặt lại mật khẩu</h1>
                            </td>
                        </tr>
                        <tr>
                            <td class="content">
                                <p class="text">Xin chào,</p>
                                <p class="text">Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản sử dụng email này.</p>
                                <p class="text">Đây là email test được gửi qua Mailtrap.</p>
                                <p class="text">Hiện tại chức năng đặt lại mật khẩu đang ở chế độ demo.</p>
                                <p class="note">Nếu bạn không yêu cầu thao tác này, vui lòng bỏ qua email này.</p>

                                <div class="cta-wrap">
                                    <a href="{{ $resetLink }}" class="cta">Mở trang đặt lại mật khẩu</a>
                                </div>

                                <p class="plain-link">Email nhận: {{ $email }}<br>Liên kết demo: {{ $resetLink }}</p>
                            </td>
                        </tr>
                        <tr>
                            <td class="footer">
                                {{ $brandName }} - Email tự động, vui lòng không trả lời lại.
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
