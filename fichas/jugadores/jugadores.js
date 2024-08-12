document.addEventListener('DOMContentLoaded', function() {
    const menuIcon = document.getElementById('menu-icon');
    const menu = document.querySelector('.menu');
    const menuItemAños = document.querySelector('.menu-item.menu-item-anios');
    const submenu = document.querySelector('.submenu');
    const historicalTableBody = document.getElementById('historicalTableBody'); // Cuerpo de la tabla histórica
    let playerName = getPlayerNameFromURL(); // Obtener el nombre del jugador del nombre del archivo HTML

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

    // Función para obtener el nombre del jugador del nombre del archivo HTML
    function getPlayerNameFromURL() {
        const path = window.location.pathname;
        const filename = path.split('/').pop(); // Obtener el nombre del archivo HTML (ej. alejo-lazzara.html)
        const playerName = filename.split('.')[0]; // Obtener el nombre del jugador sin la extensión
        return playerName;
    }

    // Llamar a la función para obtener y mostrar la tabla histórica
    fetchAndDisplayHistoricalTable(playerName);

    // Función para obtener y mostrar la tabla histórica del jugador
    function fetchAndDisplayHistoricalTable(playerName) {
        // Llamar a la función para obtener los datos de la hoja de cálculo
        fetchSheetData(sheetId, apiKey, sheetName)
            .then(data => {
                console.log('Datos obtenidos de la hoja de cálculo:', data);

                // Procesar los datos para obtener las estadísticas del jugador
                const statsByYear = processPlayerStats(data, playerName);

                // Mostrar las estadísticas en la tabla histórica
                displayPlayerStats(statsByYear);
            })
            .catch(error => {
                console.error('Error al obtener los datos de la hoja de cálculo:', error);
            });
    }

    // Función para obtener los datos de la hoja de cálculo desde Google Sheets
    async function fetchSheetData(sheetId, apiKey, sheetName) {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.values;
    }

    // Función para procesar las estadísticas del jugador
    function processPlayerStats(data, playerName) {
        // Inicializar variables para estadísticas generales
        let totalPJ = 0, totalG = 0, totalE = 0, totalP = 0, totalGo = 0;

        // Objeto para almacenar estadísticas por año
        const statsByYear = [];

        // Iterar sobre los datos para encontrar las estadísticas del jugador
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            const fecha = row[0]; // Obtener la fecha del partido
            const equipoA = row[1]; // Nombre del Equipo A
            const golesEquipoA = row[2]; // Goles del Equipo A
            const goleadoresEquipoA = row[5].split(',').map(g => g.trim()); // Goleadores del Equipo A
            const equipoB = row[4]; // Nombre del Equipo B
            const golesEquipoB = row[3]; // Goles del Equipo B
            const goleadoresEquipoB = row[6].split(',').map(g => g.trim()); // Goleadores del Equipo B

            // Verificar si el jugador está en alguno de los equipos y si participó en el partido
            if (equipoA.includes(playerName) || equipoB.includes(playerName)) {
                let jugoPartido = false;
                let golesMarcados = 0;

                // Verificar si el jugador marcó goles en el Equipo A
                if (equipoA.includes(playerName) && goleadoresEquipoA.includes(playerName)) {
                    jugoPartido = true;
                    golesMarcados += parseInt(golesEquipoA);
                }

                // Verificar si el jugador marcó goles en el Equipo B
                if (equipoB.includes(playerName) && goleadoresEquipoB.includes(playerName)) {
                    jugoPartido = true;
                    golesMarcados += parseInt(golesEquipoB);
                }

                // Si el jugador jugó el partido y marcó goles, actualizar estadísticas por año
                if (jugoPartido && golesMarcados > 0) {
                    const year = new Date(fecha).getFullYear().toString();
                    let stats = statsByYear.find(stat => stat.año === year);
                    if (!stats) {
                        stats = { año: year, pj: 0, g: 0, e: 0, p: 0, go: 0, gpg: 0 };
                        statsByYear.push(stats);
                    }
                    stats.pj++;
                    totalPJ++;
                    stats.g += (golesMarcados > golesEquipoA ? 1 : 0); // Determinar si ganó el equipo A
                    stats.g += (golesMarcados > golesEquipoB ? 1 : 0); // Determinar si ganó el equipo B
                    stats.e += (golesEquipoA === golesEquipoB ? 1 : 0); // Determinar si empató el partido
                    stats.p += (golesMarcados < golesEquipoA ? 1 : 0); // Determinar si perdió el equipo A
                    stats.p += (golesMarcados < golesEquipoB ? 1 : 0); // Determinar si perdió el equipo B
                    stats.go += golesMarcados;
                    totalG += (golesMarcados > golesEquipoA ? 1 : 0); // Sumar victorias totales
                    totalG += (golesMarcados > golesEquipoB ? 1 : 0); // Sumar victorias totales
                    totalE += (golesEquipoA === golesEquipoB ? 1 : 0); // Sumar empates totales
                    totalP += (golesMarcados < golesEquipoA ? 1 : 0); // Sumar derrotas totales
                    totalP += (golesMarcados < golesEquipoB ? 1 : 0); // Sumar derrotas totales
                    totalGo += golesMarcados;
                }
            }
        }

        // Calcular GPG (Goles por partido) para cada año con goles
        statsByYear.forEach(stat => {
            stat.gpg = stat.go / stat.pj;
        });

        // Agregar fila 'Total' al final con estadísticas generales
        const totalStats = {
            año: 'Total',
            pj: totalPJ,
            g: totalG,
            e: totalE,
            p: totalP,
            go: totalGo,
            gpg: totalGo / totalPJ
        };
        statsByYear.push(totalStats);

        return statsByYear;
    }

    // Función para mostrar las estadísticas del jugador en la tabla histórica
    function displayPlayerStats(statsByYear) {
        // Limpiar tabla histórica existente (opcional)
        historicalTableBody.innerHTML = '';

        // Iterar sobre las estadísticas por año y agregar filas a la tabla
        statsByYear.forEach(stats => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${stats.año}</td>
                <td>${stats.pj}</td>
                <td>${stats.g}</td>
                <td>${stats.e}</td>
                <td>${stats.p}</td>
                <td>${stats.go}</td>
                <td>${stats.gpg.toFixed(2)}</td>
            `;
            historicalTableBody.appendChild(row);
        });
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




















