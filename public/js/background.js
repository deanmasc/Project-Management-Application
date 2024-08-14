function changeBackground(imagePath) {
    // changes background image
    document.body.style.backgroundImage = `url(${imagePath})`;
    document.body.style.backgroundSize = 'cover';
    localStorage.setItem('backgroundImage', imagePath);
}

function backgroundDarkMode(enable) {
    // checks if the background is in dark mode and ensures it
    if (enable) {
      document.querySelector('html').setAttribute('data-bs-theme', 'dark')
      document.getElementById('darkModeToggle').innerHTML = 'Switch to light mode'
      localStorage.setItem('theme','dark')
    }
    else if(!enable) {
      document.querySelector('html').setAttribute('data-bs-theme', 'light')
      document.getElementById('darkModeToggle').innerHTML = 'Switch to dark mode'
      localStorage.setItem('theme','light')
    }
  
  }
document.addEventListener('DOMContentLoaded', (event) => {
    // Check and apply the saved background image
    const savedBackgroundImage = localStorage.getItem('backgroundImage');
    if (savedBackgroundImage) {
        document.body.style.backgroundImage = `url(${savedBackgroundImage})`;
        document.body.style.backgroundSize = 'cover';
    }

    // Check and apply the saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        const htmlElement = document.querySelector('html');
        htmlElement.setAttribute('data-bs-theme', savedTheme);
    }
});