document.addEventListener('DOMContentLoaded', function() {
    const menuIcon = document.getElementById('menu-icon');
    const menu = document.querySelector('.menu');
    const menuItemAños = document.querySelector('.menu-item.menu-item-anios');
    const submenu = document.querySelector('.submenu');
    
    menuIcon.addEventListener('click', function() {
        menu.classList.toggle('menu-open');
    });

    // Cerrar el menú si se hace clic fuera de él
    document.addEventListener('click', function(event) {
        const isClickInsideMenu = menu.contains(event.target) || menuIcon.contains(event.target);
        if (!isClickInsideMenu) {
            menu.classList.remove('menu-open');
        }
    });

    // Mostrar el submenú solo cuando se pasa el mouse sobre 'Años'
    menuItemAños.addEventListener('mouseover', function() {
        submenu.style.display = 'block';
        submenu.style.left = menuItemAños.offsetLeft + menuItemAños.offsetWidth + 'px'; // Alineado a la derecha de 'Años'
        submenu.style.top = menuItemAños.offsetTop + 'px';
        submenu.style.width = getLongestWordWidth(submenu) + 'px'; // Establecer el ancho según la palabra más larga
    });

    // Ocultar el submenú si se hace clic fuera de él
    document.addEventListener('click', function(event) {
        if (!menuItemAños.contains(event.target) && !submenu.contains(event.target)) {
            submenu.style.display = 'none';
        }
    });

    // Ocultar el submenú si el mouse sale de 'Años'
    menuItemAños.addEventListener('mouseout', function(event) {
        if (!submenu.contains(event.relatedTarget)) {
            submenu.style.display = 'none';
        }
    });

    // Función para obtener el ancho de la palabra más larga en el submenú
    function getLongestWordWidth(element) {
        const words = element.querySelectorAll('li');
        let longestWidth = 0;
        words.forEach(word => {
            longestWidth = Math.max(longestWidth, word.offsetWidth);
        });
        return longestWidth;
    }
});