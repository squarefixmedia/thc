# Trinity Home Care · website and booking app

Home nursing in Pride World City, Pune · trinityhomecare.in · +91 75885 20148

## What's here
- `index.html`: the website (Framer-style version)
- `book/`: the booking app (works as a phone app when added to the home screen)
- `admin/`: the desk's bookings page (password protected)
- `api/`: receives bookings (PHP)
- `assets/`, `img/`: styles, scripts, fonts, photos and the original logo files

## Going live on Hostinger
1. Upload everything to `public_html`.
2. In `api/`, copy `config.example.php` to `config.php` and fill in:
   - `admin_password` for trinityhomecare.in/admin/
   - `notify_email` if you want an email for each booking
   - `sheet_webhook` and `sheet_secret` if bookings should go to the Google Sheet
3. Open trinityhomecare.in/book/ and make a test booking.

`config.php` holds the passwords, so it is listed in `.gitignore` and never goes to GitHub.
When updating the site later, don't overwrite `api/config.php` or the `data/` folder on the server.

## Note
GitHub Pages can show the site, but online booking needs PHP (Hostinger). On GitHub Pages the booking
form still works through WhatsApp and phone.

Brand: Navy #12304F · Care Teal #1A7F79 · Mint #8ED3CC · Cream #FAF7F2 · Newsreader, Hanken Grotesk, Mukta.
