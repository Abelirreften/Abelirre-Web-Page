document.addEventListener('DOMContentLoaded', () => {
    
    // 1. CONFIGURACIÓN
    const YOUTUBE_CHANNEL_ID = "UCEfEyfnWI3GBCrByIXBnMEw"; // ID YouTube (config de YouTube)

    // 2. DATOS DE JUEGOS Y PROYECTOS
    const MY_GAMES = [
        {
            title: "Blood Runner",
            description: "Un platformer 2D pixel art con enemigos y mucho frenetismo. Proyecto universitario.",
            image: "assets/images/BloodRunner_Portada.png",
            link: "https://abelirre.itch.io/bloodrunner"
        },
        {
            title: "Desinformator",
            description: "Juego 3D en primera persona en el que el jugador está en un sótano intentando desinformar al mundo entero.",
            image: "assets/images/Desinformator_Portada.png",
            link: "https://abelirre.itch.io/desinformator"
        },
        {
            title: "The Warehouse",
            description: "Adéntrate en un almacén aislado en las montañas y descubre los secretos más oscuros que allí se guardan.",
            image: "assets/images/TheWarehouse_Portada.png",
            link: "https://abelirre.itch.io/the-warehouse"
        },
    ];

    // RENDER TARJETA JUEGOS
    const gamesContainer = document.getElementById('games-container');
    if(gamesContainer) {
        gamesContainer.innerHTML = MY_GAMES.map(game => `
            <div class="project-card animate-on-scroll">
                <div class="card-media">
                    <img src="${game.image}" alt="${game.title}" onerror="this.style.display='none';this.parentElement.style.background='#2a2a3d'">
                </div>
                <div class="card-content">
                    <h3 class="card-title">${game.title}</h3>
                    <p class="card-desc">${game.description}</p>
                    <a href="${game.link}" target="_blank" class="card-link">Jugar Ahora →</a>
                </div>
            </div>
        `).join('');
    }

    // FETCH YOUTUBE VIDEOS (Automático vía RSS a JSON)
    const ytContainer = document.getElementById('youtube-container');
    
    const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;
    const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;

    if(ytContainer) {
        fetch(API_URL)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok') {
                    
                    const videos = data.items.slice(0, 8); // Límite de paneles (min / max)
                    
                    ytContainer.innerHTML = videos.map(video => {
                        
                        const videoId = video.link.split('v=')[1]; // Extraer ID del video
                        
                        const thumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`; // 'maxresdefault.jpg' para miniaturas a 16:9
                        
                        return `
                        <div class="project-card animate-on-scroll">
                            <div class="card-media">
                                <a href="${video.link}" target="_blank" style="display:block; width:100%; height:100%; position:relative;">
                                    <img src="${thumbnail}" alt="${video.title}" style="width:100%; height:100%; object-fit:cover; display:block;">
                                    <div class="play-overlay">▶</div>
                                </a>
                            </div>
                            <div class="card-content">
                                <h3 class="card-title">${video.title}</h3>
                                <p class="card-desc">Publicado el: ${new Date(video.pubDate).toLocaleDateString()}</p>
                                <a href="${video.link}" target="_blank" class="card-link">Ver en YouTube →</a>
                            </div>
                        </div>
                        `;
                    }).join('');
                    
                    observeAnimations();
                } else {
                    ytContainer.innerHTML = `<p class="text-center">No se pudieron cargar los vídeos.</p>`;
                }
            })
            .catch(error => {
                console.error('Error cargando YouTube:', error);
                ytContainer.innerHTML = `<p class="text-center">Error de conexión con YouTube.</p>`;
            });
    }

    // ANIMACIONES SCROLL
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    function observeAnimations() {
        document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    }
    observeAnimations();

    // CONFIG MENU EN MÓVIL
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if(navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
        
        // Cerrar menú al hacer click en enlace
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => navMenu.classList.remove('active'));
        });
    }

    // ESTADÍSTICAS DE YOUTUBE
    
    // API KEY (Google Cloud Console)
    const API_KEY = "AIzaSyA9IqIgrr_-VsaGevqxSDi9sEUbXUbGULg"; 

    // Horas de Visualización - CAMBIO MANUAL (no se puede actualizar, son datos privados de YT)
    const MANUAL_WATCH_HOURS = "25.700+"; 

    const statsContainer = document.querySelector('.stats-grid');

    if(statsContainer && API_KEY) { 
        const STATS_URL = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${YOUTUBE_CHANNEL_ID}&key=${API_KEY}`;

        fetch(STATS_URL)
            .then(res => res.json())
            .then(data => {
                if(data.items && data.items.length > 0) {
                    const stats = data.items[0].statistics;

                    // Función para formatear números
                    const formatNum = (num) => new Intl.NumberFormat('es-ES').format(num);

                    // Inyectar datos en el HTML
                    document.getElementById('stat-subs').innerText = formatNum(stats.subscriberCount);
                    document.getElementById('stat-views').innerText = formatNum(stats.viewCount);
                    document.getElementById('stat-videos').innerText = formatNum(stats.videoCount);
                    document.getElementById('stat-hours').innerText = MANUAL_WATCH_HOURS;
                } else {
                    console.error("La API no devolvió datos. Revisa el ID del canal.");
                }
            })
            .catch(err => console.error("Error cargando stats:", err));
    } else {
        // Datos de ejemplo si falla algo
        if(document.getElementById('stat-subs')) {
            document.getElementById('stat-subs').innerText = "---";
            document.getElementById('stat-hours').innerText = MANUAL_WATCH_HOURS;
        }
    }
});