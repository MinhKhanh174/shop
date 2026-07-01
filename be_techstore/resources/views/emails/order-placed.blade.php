@php
    $orderId = data_get($order, 'id', '---');
    $customerName = trim((string) data_get($order, 'customer.fullName', '')) ?: 'khách hàng';
    $customerEmail = trim((string) data_get($order, 'customer.email', '')) ?: '---';
    $customerPhone = trim((string) data_get($order, 'customer.phone', '')) ?: '---';
    $items = data_get($order, 'items', []);
    $subtotal = (float) data_get($order, 'subtotal', 0);
    $shippingFee = (float) data_get($order, 'shippingFee', 0);
    $discount = (float) data_get($order, 'discount', 0);
    $grandTotal = (float) data_get($order, 'grandTotal', 0);
    $paymentMethod = trim((string) data_get($order, 'paymentMethod', '')) ?: '---';
    $paymentStatus = trim((string) data_get($order, 'paymentStatus', '')) ?: 'Đang xử lý';
    $shippingStatus = trim((string) data_get($order, 'shippingStatus', '')) ?: 'Chờ xác nhận';
    $createdAt = data_get($order, 'createdAt');
    $address = trim((string) data_get($order, 'address', ''));
    $deliveryWindow = '---';
    $rewardPoints = max(0, (int) floor($grandTotal / 10000));

    if ($createdAt) {
        try {
            $baseDate = new DateTime($createdAt);
            $startDate = clone $baseDate;
            $endDate = clone $baseDate;
            $startDate->modify('+2 days');
            $endDate->modify('+4 days');
            $deliveryWindow = $startDate->format('j') . ' - ' . $endDate->format('j') . ' Tháng ' . (int) $startDate->format('n');
        } catch (Throwable $exception) {
            $deliveryWindow = '2 - 4 ngày';
        }
    }

    $formatMoney = static function ($value) {
        return number_format((float) $value, 0, ',', '.') . 'đ';
    };

    $buildAddress = static function ($line) {
        return trim((string) $line) !== '' ? trim((string) $line) : null;
    };

    $deliveryAddress = collect([
        $buildAddress(data_get($order, 'customer.address')),
        $buildAddress(data_get($order, 'customer.wardName')),
        $buildAddress(data_get($order, 'customer.districtName')),
        $buildAddress(data_get($order, 'customer.provinceName')),
    ])->filter()->implode(', ');

    $siteUrl = rtrim(config('app.frontend_url', config('app.url')), '/');
    $historyUrl = $siteUrl . '/tai-khoan/don-hang';
    $logoUrl = asset('favicon.png');
@endphp
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xác nhận đơn hàng #{{ $orderId }}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #f3f3f3;
            font-family: Arial, Helvetica, sans-serif;
            color: #202124;
        }

        .outer {
            width: 100%;
            padding: 16px 10px 28px;
            box-sizing: border-box;
            background: #f3f3f3;
        }

        .email {
            width: 100%;
            max-width: 624px;
            margin: 0 auto;
            background: #fff;
            border: 1px solid #dedede;
            box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
            overflow: hidden;
        }

        .hero {
            background: linear-gradient(180deg, #e61e14 0%, #df120f 100%);
            color: #fff;
            text-align: center;
            padding: 16px 24px 18px;
        }

        .brand {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 10px;
            font-weight: 700;
            letter-spacing: 0.2px;
        }

        .brand img {
            width: 26px;
            height: 26px;
            object-fit: contain;
        }

        .brand span {
            font-size: 12px;
            text-transform: uppercase;
        }

        .hero-kicker {
            margin: 0 0 4px;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.4px;
            text-transform: uppercase;
        }

        .hero-title {
            margin: 0;
            font-size: 22px;
            line-height: 1.25;
            font-weight: 700;
        }

        .content {
            padding: 18px 18px 20px;
        }

        .greeting {
            margin: 0 0 8px;
            font-size: 13px;
            line-height: 1.55;
        }

        .intro {
            margin: 0 0 14px;
            font-size: 12px;
            line-height: 1.6;
            color: #5b6573;
        }

        .box {
            border: 1px solid #f0d9d2;
            border-radius: 4px;
            background: #fff;
            padding: 12px 12px 10px;
            margin-bottom: 12px;
        }

        .box-title {
            margin: 0 0 10px;
            font-size: 11px;
            line-height: 1.2;
            font-weight: 700;
            color: #ef1d16;
            text-transform: uppercase;
            letter-spacing: 0.2px;
        }

        .item {
            width: 100%;
            border-top: 1px solid #f1f1f1;
            padding-top: 10px;
            margin-top: 10px;
        }

        .item:first-of-type {
            border-top: 0;
            padding-top: 0;
            margin-top: 0;
        }

        .item-table {
            width: 100%;
            border-collapse: collapse;
        }

        .thumb {
            width: 44px;
            height: 44px;
            border-radius: 2px;
            background: linear-gradient(135deg, #efefef 0%, #d9d9d9 100%);
            overflow: hidden;
        }

        .thumb img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .thumb-fallback {
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #cfd4dc 0%, #f4f4f4 100%);
        }

        .item-name {
            font-size: 11px;
            line-height: 1.35;
            font-weight: 700;
            color: #111;
            margin: 0 0 2px;
        }

        .item-meta {
            font-size: 10px;
            line-height: 1.3;
            color: #7b818c;
            margin: 0;
        }

        .item-price {
            font-size: 12px;
            line-height: 1.2;
            font-weight: 700;
            color: #111;
            white-space: nowrap;
        }

        .summary {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        .summary td {
            padding: 4px 0;
            font-size: 11px;
            line-height: 1.4;
            color: #6c7480;
        }

        .summary td:last-child {
            text-align: right;
        }

        .summary .free {
            color: #169c54;
        }

        .summary .total-row td {
            padding-top: 10px;
            border-top: 1px solid #f1d9d3;
        }

        .summary .grand {
            color: #ef1d16;
            font-size: 18px;
            font-weight: 700;
        }

        .info-grid {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 10px;
        }

        .info-grid td {
            width: 50%;
            vertical-align: top;
        }

        .mini-box {
            border: 1px solid #f0d9d2;
            border-radius: 4px;
            background: #fff;
            padding: 10px 12px;
            margin-right: 8px;
        }

        .mini-box--right {
            margin-right: 0;
            margin-left: 8px;
        }

        .mini-label {
            display: flex;
            align-items: center;
            gap: 6px;
            margin: 0 0 8px;
            font-size: 11px;
            line-height: 1.2;
            font-weight: 700;
            color: #ef1d16;
            text-transform: uppercase;
        }

        .mini-title {
            margin: 0 0 4px;
            font-size: 13px;
            line-height: 1.35;
            font-weight: 700;
            color: #111;
        }

        .mini-text {
            margin: 0;
            font-size: 10px;
            line-height: 1.55;
            color: #6b7280;
        }

        .cta-wrap {
            text-align: center;
            padding: 4px 0 2px;
        }

        .cta {
            display: inline-block;
            background: #ef1d16;
            color: #fff !important;
            text-decoration: none;
            border-radius: 3px;
            padding: 11px 26px;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.2px;
        }

        .reward {
            margin-top: 14px;
            background: #fff0c3;
            border-top: 1px solid #f4e1a0;
            border-bottom: 1px solid #f4e1a0;
            text-align: center;
            padding: 16px 16px 14px;
        }

        .reward-title {
            margin: 0 0 4px;
            font-size: 14px;
            line-height: 1.35;
            font-weight: 700;
            color: #8a6200;
        }

        .reward-text {
            margin: 0;
            font-size: 11px;
            line-height: 1.45;
            color: #8f6b10;
        }

        .footer {
            background: #f0f0f0;
            text-align: center;
            padding: 18px 18px 20px;
            color: #6b7280;
        }

        .footer-brand {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #c7c7c7;
            font-weight: 700;
            margin-bottom: 12px;
        }

        .footer-brand img {
            width: 28px;
            height: 28px;
            object-fit: contain;
            opacity: 0.8;
        }

        .socials {
            margin: 0 0 12px;
        }

        .socials a {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            margin: 0 4px;
            border-radius: 999px;
            border: 1px solid #d0d0d0;
            background: #fff;
            color: #666;
            text-decoration: none;
            font-size: 11px;
            font-weight: 700;
        }

        .footer-links {
            margin: 0 0 10px;
            font-size: 10px;
            line-height: 1.8;
        }

        .footer-links a {
            color: #6b7280;
            text-decoration: none;
            margin: 0 6px;
        }

        .contact-line {
            margin: 0 0 8px;
            font-size: 10px;
            line-height: 1.55;
            color: #717171;
        }

        .copyright {
            margin: 0;
            font-size: 10px;
            line-height: 1.5;
            color: #9ca3af;
        }

        @media only screen and (max-width: 640px) {
            .hero-title {
                font-size: 20px;
            }

            .content {
                padding: 16px 14px 18px;
            }

            .info-grid,
            .info-grid tbody,
            .info-grid tr,
            .info-grid td {
                display: block;
                width: 100% !important;
            }

            .mini-box,
            .mini-box--right {
                margin: 0 0 10px;
            }
        }
    </style>
</head>
<body>
    <div class="outer">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
                <td align="center">
                    <table role="presentation" class="email" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                            <td class="hero">
                                <div class="brand">
                                    <img src="{{ $logoUrl }}" alt="Techstore">
                                    <span>Techstore.com</span>
                                </div>
                                <p class="hero-kicker">THÔNG BÁO ĐƠN HÀNG</p>
                                <h1 class="hero-title">Xác nhận đơn hàng #{{ $orderId }}</h1>
                            </td>
                        </tr>

                        <tr>
                            <td class="content">
                                <p class="greeting">Chào {{ $customerName }},</p>
                                <p class="intro">
                                    Đơn hàng của bạn đã được tiếp nhận thành công. Chúng tôi đang chuẩn bị hàng để giao cho bạn trong thời gian sớm nhất.
                                </p>

                                <div class="box">
                                    <p class="box-title">Chi tiết sản phẩm</p>

                                    @forelse ($items as $item)
                                        @php
                                            $itemName = trim((string) data_get($item, 'name', 'Sản phẩm')) ?: 'Sản phẩm';
                                            $quantity = (int) data_get($item, 'quantity', 1);
                                            $price = (float) data_get($item, 'price', 0);
                                            $lineTotal = $quantity * $price;
                                            $image = trim((string) data_get($item, 'image', ''));
                                            $hasImage = $image && preg_match('/^(https?:\/\/|data:image\/)/i', $image);
                                        @endphp

                                        <table role="presentation" class="item-table" cellspacing="0" cellpadding="0" border="0">
                                            <tr>
                                                <td width="52" valign="top">
                                                    <div class="thumb">
                                                        @if ($hasImage)
                                                            <img src="{{ $image }}" alt="{{ $itemName }}">
                                                        @else
                                                            <div class="thumb-fallback" aria-hidden="true"></div>
                                                        @endif
                                                    </div>
                                                </td>
                                                <td valign="top" style="padding-left: 10px;">
                                                    <p class="item-name">{{ $itemName }}</p>
                                                    <p class="item-meta">Số lượng: {{ str_pad((string) $quantity, 2, '0', STR_PAD_LEFT) }}</p>
                                                </td>
                                                <td valign="top" align="right" class="item-price">
                                                    {{ $formatMoney($lineTotal) }}
                                                </td>
                                            </tr>
                                        </table>
                                    @empty
                                        <p class="item-meta" style="margin: 0;">Không có sản phẩm nào trong đơn hàng.</p>
                                    @endforelse

                                    <table role="presentation" class="summary" cellspacing="0" cellpadding="0" border="0">
                                        <tr>
                                            <td>Tạm tính:</td>
                                            <td>{{ $formatMoney($subtotal) }}</td>
                                        </tr>
                                        <tr>
                                            <td>Phí vận chuyển:</td>
                                            <td class="{{ $shippingFee <= 0 ? 'free' : '' }}">{{ $shippingFee <= 0 ? 'Miễn phí' : $formatMoney($shippingFee) }}</td>
                                        </tr>
                                        @if ($discount > 0)
                                            <tr>
                                                <td>Giảm giá:</td>
                                                <td>-{{ $formatMoney($discount) }}</td>
                                            </tr>
                                        @endif
                                        <tr class="total-row">
                                            <td><strong>Tổng cộng</strong></td>
                                            <td class="grand">{{ $formatMoney($grandTotal) }}</td>
                                        </tr>
                                    </table>
                                </div>

                                <table role="presentation" class="info-grid" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                        <td>
                                            <div class="mini-box">
                                                <p class="mini-label">Địa chỉ nhận hàng</p>
                                                <p class="mini-title">{{ $customerName }}</p>
                                                <p class="mini-text">{{ $customerPhone }}</p>
                                                <p class="mini-text">{{ $deliveryAddress ?: ($address ?: '---') }}</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="mini-box mini-box--right">
                                                <p class="mini-label">Thanh toán</p>
                                                <p class="mini-title">{{ $paymentMethod }}</p>
                                                <p class="mini-text">Trạng thái: {{ $paymentStatus }}</p>
                                                <p class="mini-text">Vận chuyển: {{ $shippingStatus }}</p>
                                            </div>
                                        </td>
                                    </tr>
                                </table>

                                <div class="cta-wrap">
                                    <a href="{{ $historyUrl }}" class="cta">XEM LỊCH SỬ ĐƠN HÀNG</a>
                                </div>

                                <div class="reward">
                                    <p class="reward-title">Bạn có {{ number_format($rewardPoints, 0, ',', '.') }} điểm thưởng!</p>
                                    <p class="reward-text">
                                        Sử dụng điểm tích lũy mua sắm tiếp theo để nhận ưu đãi lên đến 500.000đ.
                                    </p>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td class="footer">
                                <div class="footer-brand">
                                    <img src="{{ $logoUrl }}" alt="Techstore">
                                    <span>Techstore.com</span>
                                </div>

                                <div class="socials" aria-label="Mạng xã hội">
                                    <a href="https://facebook.com" target="_blank" rel="noreferrer">f</a>
                                    <a href="https://instagram.com" target="_blank" rel="noreferrer">ig</a>
                                    <a href="https://youtube.com" target="_blank" rel="noreferrer">yt</a>
                                </div>

                                <p class="contact-line">Hotline: 1900 1236 &nbsp;|&nbsp; Email: support@techstore.vn</p>

                                <p class="footer-links">
                                    <a href="{{ $siteUrl }}">Chính sách trả hàng</a>
                                    <a href="{{ $siteUrl }}">Điều khoản dịch vụ</a>
                                    <a href="{{ $siteUrl }}">Chính sách vận chuyển</a>
                                    <a href="{{ $siteUrl }}">Liên hệ</a>
                                </p>

                                <p class="copyright">© 2026 TechStore Electronics. Mọi quyền được bảo lưu.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
