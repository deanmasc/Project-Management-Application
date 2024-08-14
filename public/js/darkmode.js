/**
 * Switches page between light and dark mode
 */
function darkMode() {
    if(document.querySelector('html').getAttribute('data-bs-theme') != 'dark') {
      document.querySelector('html').setAttribute('data-bs-theme', 'dark')
      document.getElementById('darkModeToggle').innerHTML = 'Switch to light mode'
      localStorage.setItem('theme','dark')
    } else {
      document.querySelector('html').setAttribute('data-bs-theme', 'light')
      document.getElementById('darkModeToggle').innerHTML = 'Switch to dark mode'
      localStorage.setItem('theme','light')
    }
  }

/**
 * Check if the page is in light or dark mode
 */
function checkDarkMode() {
    if (localStorage.getItem('theme') != 'dark'){
        document.querySelector('html').setAttribute('data-bs-theme', 'light')
        document.getElementById('darkModeToggle').innerHTML = 'Switch to dark mode'
    }else{
        document.querySelector('html').setAttribute('data-bs-theme', 'dark')
        document.getElementById('darkModeToggle').innerHTML = 'Switch to light mode'
    }
}