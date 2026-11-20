import {LANGUAGES, resolveLanguage, setLanguage, strings} from '../strings';

describe('language choice', () => {
  it('uses the chosen language', () => {
    expect(resolveLanguage('en', ['de-DE'])).toBe('en');
  });

  it('follows the phone when set to system', () => {
    expect(resolveLanguage('system', ['en-GB'])).toBe('en');
    expect(resolveLanguage('system', ['EN_us'])).toBe('en');
  });

  it('has Finnish', () => {
    expect(resolveLanguage('system', ['fi-FI'])).toBe('fi');
    expect(resolveLanguage('system', ['sv-SE', 'fi-FI'])).toBe('fi');
    expect(resolveLanguage('fi', ['en-US'])).toBe('fi');
  });

  it('switches the texts and back', () => {
    setLanguage('fi');
    expect(strings.drive.title).toBe(LANGUAGES.fi.drive.title);
    setLanguage('en');
    expect(strings.drive.title).toBe(LANGUAGES.en.drive.title);
  });

  it('falls back to English for languages the app does not have', () => {
    expect(resolveLanguage('system', ['xx-YY'])).toBe('en');
    expect(resolveLanguage('system', [])).toBe('en');
    // A saved language that has since been removed.
    expect(resolveLanguage('zz', ['xx'])).toBe('en');
  });

  it('keeps one strings object when the language is set', () => {
    const before = strings;
    setLanguage('en');
    expect(strings).toBe(before);
    expect(strings.drive.title).toBe(LANGUAGES.en.drive.title);
  });
});
