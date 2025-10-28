const fs = require('fs').promises;
const path = require('path');

// Placeholder languages that need format updates
const placeholderLanguages = [
  'fr', 'de', 'it', 'pt', 'ru', 'nl', 'bn', 'te', 'mr', 'gu',
  'kn', 'ml', 'pa', 'or', 'as', 'ur', 'fa', 'tr', 'he', 'zh',
  'ja', 'ko', 'th'
];

async function updatePlaceholderFormats() {
  const localesDir = path.join(__dirname, '..', 'src', 'services', 'i18n', 'locales');

  for (const langCode of placeholderLanguages) {
    const filePath = path.join(localesDir, `${langCode}.json`);

    try {
      const content = await fs.readFile(filePath, 'utf8');
      let data = JSON.parse(content);

      // Update the prompts section
      if (data.prompts && data.prompts.birth_date) {
        data.prompts.birth_date.request = "Please enter your birth date (DDMMYY or DDMMYYYY format)";
        data.prompts.birth_date.invalid = "Invalid date format. Please use DDMMYY or DDMMYYYY format.";
      }

      if (data.prompts && data.prompts.birth_time) {
        data.prompts.birth_time.request = "Please enter your birth time (HHMM format)";
        data.prompts.birth_time.invalid = "Invalid time format. Please use HHMM format.";
      }

      // Write back the updated content
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`Updated ${langCode}.json`);
    } catch (error) {
      console.error(`Error updating ${langCode}.json:`, error.message);
    }
  }

  console.log(`\nUpdated ${placeholderLanguages.length} placeholder locale files with strict date/time formats.`);
}

if (require.main === module) {
  updatePlaceholderFormats().catch(console.error);
}

module.exports = { updatePlaceholderFormats };