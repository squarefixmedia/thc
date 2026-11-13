<?php
/* ============================================================
   Trinity Home Care · booking settings
   Copy this file to config.php on the server, fill in the values, then Save.
   config.php is never committed to GitHub (see .gitignore).
   ============================================================ */
return [
  // Password for the desk's bookings page (trinityhomecare.in/admin/)
  'admin_password' => '',

  // Where new-booking emails go (leave '' to switch off email alerts)
  'notify_email'   => '',
  // "From" address: use an email on your domain (create it in Hostinger > Emails)
  'from_email'     => 'bookings@trinityhomecare.in',

  // Google Sheet: paste the Apps Script "Web app URL" here (leave '' to switch off)
  'sheet_webhook'  => '',
  // Must match SECRET in the Apps Script
  'sheet_secret'   => '',

  // Desk WhatsApp number, digits only with country code
  'whatsapp'       => '917588520148',
];
