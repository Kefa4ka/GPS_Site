let map = L.map('map').setView([50.45466, 30.5238], 13); // Київ, Україна

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let marker, routeLayer, routeCoordinates = [], tracking = false, startTime, timer;

// Додавання маркера на карту
function updateSpeed(position) {
    const speed = position.coords.speed ? (position.coords.speed * 3.6).toFixed(1) : '0';
    document.getElementById('speed').textContent = speed;

    const speedPercentage = Math.min(speed / 100, 1) * 100;
    document.getElementById('progress').style.width = `${speedPercentage}%`;

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    if (!marker) {
        marker = L.marker([lat, lon]).addTo(map);
        map.setView([lat, lon], 16);
    } else {
        marker.setLatLng([lat, lon]);
    }

    if (tracking) {
        routeCoordinates.push([lat, lon]);
        if (!routeLayer) {
            routeLayer = L.polyline(routeCoordinates, { color: '#007bff', weight: 4 }).addTo(map);
        } else {
            routeLayer.setLatLngs(routeCoordinates);
        }
    }
}

function handleError(error) {
    alert('Неможливо отримати дані геолокації');
}

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(updateSpeed, handleError, { enableHighAccuracy: true });
} else {
    alert('Геолокація не підтримується на цьому пристрої');
}

// Кнопка для початку трекінгу
document.getElementById('startTracking').addEventListener('click', () => {
    tracking = true;
    routeCoordinates = [];
    if (routeLayer) {
        map.removeLayer(routeLayer);
        routeLayer = null;
    }
    startTime = Date.now();
    document.getElementById('startSound').play();
    timer = setInterval(() => {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        document.getElementById('timeElapsed').textContent = `Час: ${elapsed} сек`;
    }, 1000);
});

// Кнопка для скидання маршруту
document.getElementById('reset').addEventListener('click', () => {
    tracking = false;
    clearInterval(timer);
    routeCoordinates = [];
    document.getElementById('timeElapsed').textContent = 'Час: 0 сек';
    if (routeLayer) {
        map.removeLayer(routeLayer);
        routeLayer = null;
    }
    document.getElementById('resetSound').play();
    alert('Маршрут скинуто');
});

// Збереження маршруту
document.getElementById('downloadRoute').addEventListener('click', () => {
    if (routeCoordinates.length > 0) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(routeCoordinates));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "route.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        document.getElementById('saveSound').play();
    } else {
        alert('Немає маршруту для збереження.');
    }
});

// Темний режим
document.getElementById('darkModeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        document.getElementById('darkModeToggle').textContent = '🌞';
    } else {
        document.getElementById('darkModeToggle').textContent = '🌙';
    }
});

// Автоматичне перемикання теми
function updateTheme() {
    const hours = new Date().getHours();
    if (hours >= 18 || hours < 6) {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeToggle').textContent = '🌞';
    } else {
        document.body.classList.remove('dark-mode');
        document.getElementById('darkModeToggle').textContent = '🌙';
    }
}
updateTheme();
