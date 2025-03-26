// If localStorage is not available or theme preference is set to 'system',
// force dark mode and update theme color meta tag
if (!localStorage || localStorage.theme === 'system') {
  document.documentElement.classList.add('dark');
  document.documentElement.classList.remove('light');

  const metaThemeColorTag = document.querySelector('meta[name="theme-color"]');
  metaThemeColorTag.setAttribute('content', '#171717');
}
