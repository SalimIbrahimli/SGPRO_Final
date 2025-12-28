<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$to_email   = "imran.ibrahimov@gmail.com";
$from_email = "noreply@example.com";
$from_name  = "Website Contact Form";

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!is_array($data) || !isset($data['fullName'], $data['emailAddress'], $data['messageContent'])) {
  echo json_encode(['success' => false, 'message' => 'Bütün məcburi xanaları doldurun']);
  exit;
}

$fullName = htmlspecialchars(strip_tags($data['fullName']));
$emailAddress = filter_var($data['emailAddress'], FILTER_SANITIZE_EMAIL);
$companyName = isset($data['companyName']) ? htmlspecialchars(strip_tags($data['companyName'])) : 'N/A';
$serviceInterested = isset($data['serviceInterested']) ? htmlspecialchars(strip_tags($data['serviceInterested'])) : 'N/A';
$messageContent = htmlspecialchars(strip_tags($data['messageContent']));
$timestamp = isset($data['timestamp']) ? $data['timestamp'] : date('Y-m-d H:i:s');

if (!filter_var($emailAddress, FILTER_VALIDATE_EMAIL)) {
  echo json_encode(['success' => false, 'message' => 'Düzgün email daxil edin']);
  exit;
}

$subject = "Yeni mesaj: $fullName - Contact Form";

$email_body = "
<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8' />
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #6c5dd3 0%, #8b5dd3 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .field { margin-bottom: 20px; }
    .field-label { font-weight: bold; color: #6c5dd3; }
    .field-value { margin-top: 5px; padding: 10px; background: white; border-left: 3px solid #6c5dd3; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class='container'>
    <div class='header'><h2>🎉 Yeni Mesaj Alındı</h2></div>
    <div class='content'>
      <div class='field'><div class='field-label'>Ad Soyad:</div><div class='field-value'>$fullName</div></div>
      <div class='field'><div class='field-label'>Email:</div><div class='field-value'><a href='mailto:$emailAddress'>$emailAddress</a></div></div>
      <div class='field'><div class='field-label'>Şirkət:</div><div class='field-value'>$companyName</div></div>
      <div class='field'><div class='field-label'>Maraq duyulan xidmət:</div><div class='field-value'>$serviceInterested</div></div>
      <div class='field'><div class='field-label'>Mesaj:</div><div class='field-value'>$messageContent</div></div>
      <div class='footer'>
        <p>Göndərilmə tarixi: $timestamp</p>
        <p>Bu mesaj website contact formundan göndərilib.</p>
      </div>
    </div>
  </div>
</body>
</html>
";

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-type:text/html;charset=UTF-8\r\n";
$headers .= "From: $from_name <$from_email>\r\n";
$headers .= "Reply-To: $emailAddress\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

$mail_sent = mail($to_email, $subject, $email_body, $headers);

if ($mail_sent) {
  echo json_encode(['success' => true, 'message' => 'Mesajınız uğurla göndərildi']);
} else {
  echo json_encode(['success' => false, 'message' => 'Email göndərilmədi. Zəhmət olmasa yenidən cəhd edin.']);
}
