const sheetId = '1mXhvMRMyzqKwa9ON9yucrL8FHCkmal-vtQt6VSTb4Zk';
const apiKey = 'AIzaSyCwBgSjTkp3DQGRi15xTg0oosN-Ophp80w';
const sheetNames = ['Partidos', 'Goleadores', 'Mayores Ganadores', 'Mayores Perdedores'];

const partidosContainer = document.getElementById('partidos-container');
const generalTablesContainer = document.getElementById('general-tables-container');
const tablesData = {};

// Variable para almacenar el índice del partido actual
let partidoIndex = 0;
let totalPartidos = 0; // Variable para almacenar la cantidad total de partidos disponibles

// Array para almacenar todas las promesas de las solicitudes
const fetchPromises = [];

// Función para renderizar un partido específico
function renderPartido(partidoIndex) {
    // Limpiar el contenedor de partidos
    partidosContainer.innerHTML = '';

    // Obtener los datos de los partidos
    const partidosData = tablesData['Partidos'];

    // Obtener el partido correspondiente al índice dado (ignorando la primera fila)
    const partido = partidosData[partidoIndex + 1]; // Sumar 1 para omitir la primera fila

    // Si no hay partido para el índice dado, salir de la función
    if (!partido) return;

    const tableWrapper = document.createElement('div');
    tableWrapper.classList.add('table-wrapper');

    const sheetTitle = document.createElement('h2');
    sheetTitle.textContent = 'Partido ' + (partidoIndex + 1);
    tableWrapper.appendChild(sheetTitle);

    const table = document.createElement('table');
    table.classList.add('partidos-table');

    const headerRow = document.createElement('tr');
    const headers = ['Fecha', 'Equipo A', 'Goles A', 'Goles B', 'Equipo B', 'Goleadores A', 'Goleadores B'];
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.classList.add('table-header'); // Agregar la clase table-header
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    const [fecha, equipoA, golesA, golesB, equipoB, goleadoresA, goleadoresB] = partido;
    
    // Manejar el caso de goleadores vacíos
    const formattedGoleadoresA = goleadoresA ? processGoleadores(goleadoresA.split(',')) : '';
    const formattedGoleadoresB = goleadoresB ? processGoleadores(goleadoresB.split(',')) : '';

    const tableRow = document.createElement('tr');
    [fecha, equipoA, golesA, golesB, equipoB, formattedGoleadoresA, formattedGoleadoresB].forEach(cellData => {
        const td = document.createElement('td');
        td.textContent = cellData || ''; // Si la celda está vacía, mostrar un espacio en blanco
        tableRow.appendChild(td);
    });
    table.appendChild(tableRow);

    tableWrapper.appendChild(table);
    partidosContainer.appendChild(tableWrapper);
}

// Función para retroceder al partido anterior
function retrocederPartido() {
    if (partidoIndex > 0) {
        partidoIndex--;
        renderPartido(partidoIndex);
    } else {
        // Si ya estamos en el primer partido, no hacer nada
        console.log('Ya estás en el primer partido');
    }
}

// Función para avanzar al siguiente partido
function avanzarPartido() {
    // Verificar si hay un partido disponible para mostrar
    if (partidoIndex < totalPartidos - 1) {
        partidoIndex++;
        renderPartido(partidoIndex);
    } else {
        // Si no hay un partido disponible, no hacer nada
        console.log('No hay más partidos disponibles');
    }
}

// Event listener para el botón de retroceder
document.getElementById('retroceder-btn').addEventListener('click', retrocederPartido);

// Event listener para el botón de avanzar
document.getElementById('avanzar-btn').addEventListener('click', avanzarPartido);

// Realizar las solicitudes y almacenar las promesas
sheetNames.forEach(sheetName => {
    const fetchPromise = fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${apiKey}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (sheetName === 'Goleadores' || sheetName === 'Mayores Ganadores' || sheetName === 'Mayores Perdedores') {
                tablesData[sheetName] = data.values;
            } else {
                tablesData['Partidos'] = data.values;
                totalPartidos = data.values.length - 1; // Actualizar la cantidad total de partidos disponibles
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            alert('Error fetching data: ' + error.message);
        });

    fetchPromises.push(fetchPromise);
});

// Una vez que todas las solicitudes se completen, renderizar las tablas
Promise.all(fetchPromises)
    .then(() => {
        // Actualizar la cantidad total de partidos disponibles
        totalPartidos = tablesData['Partidos'].length - 1;

        // Renderizar tablas
        renderTables();

        // Inicializar mostrando el último partido si hay al menos un partido disponible
        if (totalPartidos > 0) {
            partidoIndex = totalPartidos - 1;
            renderPartido(partidoIndex);
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        alert('Error fetching data: ' + error.message);
    });

function renderTables() {
    renderGeneralTable('Goleadores', tablesData['Goleadores']);
    renderGeneralTable('Mayores Ganadores', tablesData['Mayores Ganadores']);
    renderGeneralTable('Mayores Perdedores', tablesData['Mayores Perdedores']);
}

function processGoleadores(goleadores) {
    const goleadoresCount = goleadores.reduce((acc, goleador) => {
        const nombre = goleador.trim(); // Eliminar espacios en blanco al inicio y al final
        if (nombre) {
            acc[nombre] = (acc[nombre] || 0) + 1; // Contar los goles por jugador
        }
        return acc;
    }, {});

    const goleadoresList = Object.keys(goleadoresCount).map(goleador => {
        return `(${goleadoresCount[goleador]}) ${goleador}`;
    });

    goleadoresList.sort((a, b) => {
        const golesA = parseInt(a.match(/\((\d+)\)/)[1]);
        const golesB = parseInt(b.match(/\((\d+)\)/)[1]);
        return golesB - golesA;
    });

    return goleadoresList.join(', ');
}

function renderGeneralTable(sheetName, data) {
    const tableWrapper = document.createElement('div');
    tableWrapper.classList.add('table-wrapper');

    const sheetTitle = document.createElement('h2');
    sheetTitle.textContent = sheetName;
    tableWrapper.appendChild(sheetTitle);

    const table = document.createElement('table');
    table.classList.add('table');

    if (sheetName === 'Goleadores') {
        table.classList.add('goleadores-table'); // Agregar clase específica para la tabla de Goleadores
    } else if (sheetName === 'Mayores Ganadores' || sheetName === 'Mayores Perdedores') {
        table.classList.add('mayores-table'); // Agregar clase específica para las tablas de Mayores Ganadores y Perdedores
    }

    const headerRow = document.createElement('tr');
    data[0].forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.classList.add('table-header'); // Agregar la clase table-header
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    data.slice(1).forEach(row => {
        const tableRow = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tableRow.appendChild(td);
        });
        table.appendChild(tableRow);
    });

    tableWrapper.appendChild(table);
    generalTablesContainer.appendChild(tableWrapper);
}

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

























