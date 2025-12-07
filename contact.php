<?php
// Sadə contact form mail göndərmə skripti

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Form dəyərlərini götür
    $name    = isset($_POST['name']) ? trim($_POST['name']) : '';
    $email   = isset($_POST['email']) ? trim($_POST['email']) : '';
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';

    // Sadə validasiya
    if ($name === '' || $email === '' || $message === '') {
        // Hər hansı input boşdursa error
        header("Location: HTML/contact.html?status=error");
        exit;
    }

    // BURANI DƏYİŞ: mesaj hara gəlsin?
    $to = "imran.ibrahimov@gmail.com";  // <- ÖZ emailini yaz

    $subject = "SGPRO saytından yeni əlaqə mesajı";

    $body  = "Yeni mesaj göndərildi:\n\n";
    $body .= "Ad: " . $name . "\n";
    $body .= "Email: " . $email . "\n\n";
    $body .= "Mesaj:\n" . $message . "\n";

    // From/Reply-To header-lər
    // From olaraq domenində olan mail yazsan daha stabil işləyər
    $headers  = "From: noreply@senindomenin.com\r\n";
    $headers .= "Reply-To: " . $email . "\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    // Mail göndər
    if (mail($to, $subject, $body, $headers)) {
        // Uğurlu oldu → contact səhifəsinə qaytar + status
        header("Location: HTML/contact.html?status=success");
        exit;
    } else {
        // Xəta oldu
        header("Location: HTML/contact.html?status=error");
        exit;
    }
}

// Birbaşa bu fayla GET ilə girsələr, contact səhifəsinə qaytar
header("Location: HTML/contact.html");
exit;
