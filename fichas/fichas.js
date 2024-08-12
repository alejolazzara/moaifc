const sheetId = '1whlvU9Oj-p_usGOKABTLFvZHAh10mXnRzYns4YsQo2k';
const apiKey = 'AIzaSyCwBgSjTkp3DQGRi15xTg0oosN-Ophp80w';
const sheetName = 'JugadoresActivos';

async function fetchSheetData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${apiKey}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.values;
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
    }
}

function populateTable(data) {
    const tableBody = document.getElementById('playersTable').getElementsByTagName('tbody')[0];
    data.forEach(row => {
        const tr = document.createElement('tr');

        // Crear celda para el jugador
        const td = document.createElement('td');
        td.style.textAlign = 'center'; // Alinear contenido al centro
        td.style.verticalAlign = 'middle'; // Centrar verticalmente el contenido

        // Crear imagen del equipo si está disponible
        if (row.length >= 2 && row[0]) {
            const img = document.createElement('img');
            img.src = row[0]; // Suponiendo que la columna 0 es la "Foto"
            img.alt = `Equipo de ${row[1]}`;
            img.style.width = '20px';  // Ajustar tamaño de la imagen según necesites
            img.style.height = '20px'; // Ajustar tamaño de la imagen según necesites
            img.style.marginRight = '1px'; // Espacio entre la imagen y el nombre
            img.style.verticalAlign = 'middle'; // Alinear imagen verticalmente al centro
            td.appendChild(img);
        }

        // Crear enlace al jugador
        const a = document.createElement('a');
        a.href = `jugadores/${row[1].toLowerCase().replace(/ /g, '_')}.html`; // Suponiendo que la columna 1 es el "Jugador"
        a.textContent = row[1];
        a.style.textDecoration = 'none'; // Quitar subrayado del enlace
        a.style.color = '#fff'; // Color del texto del enlace
        a.style.verticalAlign = 'middle'; // Alinear texto verticalmente al centro
        td.appendChild(a);

        // Agregar celda a la fila
        tr.appendChild(td);
        tableBody.appendChild(tr);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const sheetData = await fetchSheetData();
    if (sheetData && sheetData.length > 1) {
        populateTable(sheetData.slice(1)); // Omitir la primera fila si es el encabezado
    } else {
        console.error('No data found or unable to fetch the sheet.');
    }
});

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


















