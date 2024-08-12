document.addEventListener('DOMContentLoaded', function() {
    const menuIcon = document.getElementById('menu-icon');
    const menu = document.querySelector('.menu');
    const menuItemAños = document.querySelector('.menu-item.menu-item-anios');
    const submenu = document.querySelector('.submenu');
    const historicalTableBody = document.getElementById('historicalTableBody'); // Cuerpo de la tabla histórica
    const playerName = 'Matias Lazzara'; // Nombre del jugador

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

    // Llamar a la función para obtener y mostrar la tabla histórica
    fetchAndDisplayHistoricalTable(playerName);

    // Función para obtener y mostrar la tabla histórica del jugador
    function fetchAndDisplayHistoricalTable(playerName) {
        const sheetId = '1mXhvMRMyzqKwa9ON9yucrL8FHCkmal-vtQt6VSTb4Zk';
        const apiKey = 'AIzaSyCwBgSjTkp3DQGRi15xTg0oosN-Ophp80w';
        const sheetName = 'Partidos';
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${apiKey}`;

        // Limpiar tabla histórica existente
        historicalTableBody.innerHTML = '';

        // Obtener datos de la hoja de cálculo
        fetch(url)
            .then(response => response.json())
            .then(data => {
                // Procesar y mostrar estadísticas del jugador
                const playerStats = processPlayerStats(data.values, playerName);
                if (playerStats) {
                    displayPlayerStats(playerStats);
                } else {
                    console.error('No se encontraron estadísticas para el jugador.');
                }
            })
            .catch(error => {
                console.error('Error al obtener datos de la hoja de cálculo:', error);
            });
    }

    // Función para procesar las estadísticas del jugador
    function processPlayerStats(data, playerName) {
        // Estructura de datos de salida
        const statsByYear = {};
        let totalStats = {
            PJ: 0,
            G: 0,
            E: 0,
            P: 0,
            Go: 0
        };

        // Iterar sobre los datos y calcular estadísticas por año
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            const fecha = row[0]; // Fecha del partido
            const equipoA = row[1] ? row[1].split(',').map(player => player.trim()) : []; // Equipo A como array de jugadores
            const golesEquipoA = parseInt(row[2]) || 0; // Goles Equipo A (si no hay datos, se considera 0)
            const golesEquipoB = parseInt(row[3]) || 0; // Goles Equipo B (si no hay datos, se considera 0)
            const equipoB = row[4] ? row[4].split(',').map(player => player.trim()) : []; // Equipo B como array de jugadores
            const goleadoresEquipoA = row[5] ? row[5].split(',').map(g => g.trim()) : []; // Goleadores Equipo A como array
            const goleadoresEquipoB = row[6] ? row[6].split(',').map(g => g.trim()) : []; // Goleadores Equipo B como array

            // Verificar si el jugador está en alguno de los equipos o es goleador en el partido
            const played = equipoA.includes(playerName) || equipoB.includes(playerName);
            const scoredGoals = goleadoresEquipoA.includes(playerName) || goleadoresEquipoB.includes(playerName);

            // Obtener el año del partido
            const year = new Date(fecha).getFullYear().toString();

            // Inicializar estadísticas del año si no existe
            if (!statsByYear[year]) {
                statsByYear[year] = {
                    PJ: 0,
                    G: 0,
                    E: 0,
                    P: 0,
                    Go: 0
                };
            }

            // Incrementar partidos jugados si el jugador participó
            if (played) {
                statsByYear[year].PJ++;

                // Calcular resultados del partido si el jugador participó
                if (equipoA.includes(playerName)) {
                    if (golesEquipoA > golesEquipoB) {
                        statsByYear[year].G++; // Ganados
                    } else if (golesEquipoA === golesEquipoB) {
                        statsByYear[year].E++; // Empatados
                    } else {
                        statsByYear[year].P++; // Perdidos
                    }
                    // Contar los goles marcados por el jugador en el equipo A
                    statsByYear[year].Go += goleadoresEquipoA.filter(g => g === playerName).length;
                } else if (equipoB.includes(playerName)) {
                    if (golesEquipoB > golesEquipoA) {
                        statsByYear[year].G++; // Ganados
                    } else if (golesEquipoB === golesEquipoA) {
                        statsByYear[year].E++; // Empatados
                    } else {
                        statsByYear[year].P++; // Perdidos
                    }
                    // Contar los goles marcados por el jugador en el equipo B
                    statsByYear[year].Go += goleadoresEquipoB.filter(g => g === playerName).length;
                }
            }
        }

        // Sumar al total general
        for (const year in statsByYear) {
            totalStats.PJ += statsByYear[year].PJ;
            totalStats.G += statsByYear[year].G;
            totalStats.E += statsByYear[year].E;
            totalStats.P += statsByYear[year].P;
            totalStats.Go += statsByYear[year].Go;
        }

        // Agregar el total general a las estadísticas por año
        statsByYear['Total'] = totalStats;

        return statsByYear;
    }

// Función para mostrar las estadísticas del jugador en la tabla histórica
function displayPlayerStats(statsByYear) {
    for (const year in statsByYear) {
        const stats = statsByYear[year];

        // Verificar si todos los campos para este año son cero
        if (stats.PJ === 0 && stats.G === 0 && stats.E === 0 && stats.P === 0 && stats.Go === 0) {
            continue; // Saltar este año si todos los campos son cero
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${year}</td>
            <td>${stats.PJ}</td>
            <td>${stats.G}</td>
            <td>${stats.E}</td>
            <td>${stats.P}</td>
            <td>${stats.Go}</td>
        `;
        historicalTableBody.appendChild(row);
    }
}


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




















