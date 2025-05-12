import express from 'express';
const router = express.Router();

/**
 * Route to change the application language
 *
 * @route GET /language/:lang
 * @param {string} lang - The language code to switch to (en, zh-TW, zh-CN)
 * @returns Redirects back to the previous page with the new language set
 */
router.get('/:lang', (req, res) => {
  // Get the language from the URL parameter
  const lang = req.params.lang;

  // Get the available languages from i18n
  const availableLanguages = req.app.get('i18n').getLocales ? req.app.get('i18n').getLocales() : ['en', 'zh-TW', 'zh-CN'];

  console.log(`Available languages: ${JSON.stringify(availableLanguages)}`);
  console.log(`Requested language: ${lang}`);
  console.log(`Is language available: ${availableLanguages.includes(lang)}`);

  // Check if the requested language is available
  if (availableLanguages.includes(lang)) {
    console.log(`Switching language to: ${lang}`);

    // Set the language in the cookie
    res.cookie('locale', lang, {
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
      httpOnly: false, // Allow JavaScript to access the cookie
      path: '/' // Make cookie available for the entire site
    });

    // Set the language for the current request
    req.setLocale(lang);

    // Force the session to save the language preference
    if (req.session) {
      req.session.locale = lang;
      req.session.save();
    }

    console.log(`Current language after switch: ${req.getLocale()}`);
  } else {
    console.log(`Invalid language requested: ${lang}`);
  }

  // Redirect back to the previous page or home page
  const referer = req.get('Referer') || '/';
  res.redirect(referer);
});

export default router;
