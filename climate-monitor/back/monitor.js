/* ================= MONITORAMENTO GLOBAL ================= */

const monitorBtn = document.getElementById("monitorBtn");
const monitorOpenLinks = document.querySelectorAll("[data-open-monitor]");
const monitorOverlay = document.getElementById("monitorOverlay");
const closeMonitor = document.getElementById("closeMonitor");
const closeMonitorInfo = document.getElementById("closeMonitorInfo");
const monitorClock = document.getElementById("monitorClock");

let globeScene;
let globeCamera;
let globeRenderer;
let globeGroup;
let globeRaycaster;
let globeMouse;
let globeAnimationFrame;
let globeDrag = false;
let globeDragged = false;
let globeLastX = 0;
let globeLastY = 0;
let globeZoom = 1;
let globeInitialized = false;
let globeResizeObserver;
let selectedClimateCity = null;
let selectedClimateData = null;

const climateCities = [
    { id: "sp", city: "São Paulo", country: "Brasil", countryCode: "BR", lat: -23.55, lon: -46.63, region: "southAmerica", tags: ["heat", "water", "rain"], context: "sp" },
    { id: "manaus", city: "Manaus", country: "Brasil", countryCode: "BR", lat: -3.12, lon: -60.02, region: "southAmerica", tags: ["forests", "heat", "rain"], context: "manaus" },
    { id: "ny", city: "Nova York", country: "Estados Unidos", countryCode: "US", lat: 40.71, lon: -74.01, region: "northAmerica", tags: ["heat", "oceans", "cities"], context: "ny" },
    { id: "mexico", city: "Cidade do México", country: "México", countryCode: "MX", lat: 19.43, lon: -99.13, region: "northAmerica", tags: ["heat", "air", "water"], context: "mexico" },
    { id: "london", city: "Londres", country: "Reino Unido", countryCode: "GB", lat: 51.51, lon: -0.13, region: "europe", tags: ["heat", "rain", "cities"], context: "london" },
    { id: "sarajevo", city: "Sarajevo", country: "Bósnia e Herzegovina", countryCode: "BA", lat: 43.86, lon: 18.41, region: "europe", tags: ["heat", "mountains", "air"], context: "sarajevo" },
    { id: "moscow", city: "Moscou", country: "Rússia", countryCode: "RU", lat: 55.76, lon: 37.62, region: "europeAsia", tags: ["heat", "ice", "forests"], context: "moscow" },
    { id: "oslo", city: "Oslo", country: "Noruega", countryCode: "NO", lat: 59.91, lon: 10.75, region: "europe", tags: ["ice", "cities", "oceans"], context: "oslo" },
    { id: "cairo", city: "Cairo", country: "Egito", countryCode: "EG", lat: 30.04, lon: 31.24, region: "africa", tags: ["heat", "water", "drought"], context: "cairo" },
    { id: "lagos", city: "Lagos", country: "Nigéria", countryCode: "NG", lat: 6.52, lon: 3.38, region: "africa", tags: ["oceans", "rain", "cities"], context: "lagos" },
    { id: "capetown", city: "Cidade do Cabo", country: "África do Sul", countryCode: "ZA", lat: -33.92, lon: 18.42, region: "africa", tags: ["drought", "water", "oceans"], context: "capetown" },
    { id: "nairobi", city: "Nairóbi", country: "Quênia", countryCode: "KE", lat: -1.29, lon: 36.82, region: "africa", tags: ["water", "biodiversity", "drought"], context: "nairobi" },
    { id: "dakar", city: "Dacar", country: "Senegal", countryCode: "SN", lat: 14.69, lon: -17.45, region: "africa", tags: ["oceans", "water", "heat"], context: "dakar" },
    { id: "mumbai", city: "Mumbai", country: "Índia", countryCode: "IN", lat: 19.08, lon: 72.88, region: "asia", tags: ["heat", "rain", "cities"], context: "mumbai" },
    { id: "beijing", city: "Pequim", country: "China", countryCode: "CN", lat: 39.90, lon: 116.41, region: "asia", tags: ["heat", "air", "water"], context: "beijing" },
    { id: "astana", city: "Astana", country: "Cazaquistão", countryCode: "KZ", lat: 51.16, lon: 71.47, region: "centralAsia", tags: ["heat", "steppes", "water"], context: "astana" },
    { id: "bangkok", city: "Bangkok", country: "Tailândia", countryCode: "TH", lat: 13.76, lon: 100.50, region: "asia", tags: ["rain", "oceans", "cities"], context: "bangkok" },
    { id: "seoul", city: "Seul", country: "Coreia do Sul", countryCode: "KR", lat: 37.57, lon: 126.98, region: "asia", tags: ["heat", "rain", "cities"], context: "seoul" },
    { id: "tokyo", city: "Tóquio", country: "Japão", countryCode: "JP", lat: 35.68, lon: 139.69, region: "asia", tags: ["heat", "cities", "rain"], context: "tokyo" },
    { id: "jakarta", city: "Jacarta", country: "Indonésia", countryCode: "ID", lat: -6.21, lon: 106.85, region: "asia", tags: ["oceans", "rain", "cities"], context: "jakarta" },
    { id: "dubai", city: "Dubai", country: "Emirados Árabes Unidos", countryCode: "AE", lat: 25.20, lon: 55.27, region: "asia", tags: ["heat", "water", "cities"], context: "dubai" },
    { id: "sydney", city: "Sydney", country: "Austrália", countryCode: "AU", lat: -33.87, lon: 151.21, region: "oceania", tags: ["heat", "fires", "ecosystems"], context: "sydney" },
    { id: "auckland", city: "Auckland", country: "Nova Zelândia", countryCode: "NZ", lat: -36.85, lon: 174.76, region: "oceania", tags: ["oceans", "rain", "wind"], context: "auckland" },
    { id: "santiago", city: "Santiago", country: "Chile", countryCode: "CL", lat: -33.45, lon: -70.66, region: "southAmerica", tags: ["drought", "mountains", "water"], context: "santiago" }
];

const monitorText = {
    pt: {
        today: "HOJE",
        selectPoint: "Selecione um ponto",
        onGlobe: "no globo",
        climateMonitoring: "MONITORAMENTO CLIMÁTICO",
        checkingForecast: "Consultando previsão",
        loadingForecast: "Carregando previsão de 7 dias...",
        checkingOpenMeteo: "CONSULTANDO OPEN-METEO...",
        calculatingVariation: "calculando pela variação",
        loadingContext: "Buscando dados climáticos atuais, históricos e projeções climáticas para esta localização...",
        noForecast: "Sem previsão disponível",
        noForecastChart: "Não foi possível montar o gráfico agora.",
        forecastAverage: "Média dos próximos dias: {value}",
        yearAverage: "Média de {year}: {value}",
        feelsLike: "SENSAÇÃO {value}",
        pastAverage: "média de {year}",
        futureAverage: "média projetada de {year}",
        unavailable: "Previsão indisponível",
        noConnection: "Sem conexão com a Open-Meteo.",
        fetchError: "ERRO AO CONSULTAR DADOS",
        errorContext: "Não foi possível consultar a API agora. Verifique sua conexão com a internet e tente selecionar o ponto novamente.",
        liveData: "DADOS AO VIVO",
        clickPoint: "Open-Meteo · clique em um ponto",
        contextSuffix: "Dados atuais e previsão de 7 dias vêm da Open-Meteo. Hoje: umidade {humidity}%, vento {wind} km/h e precipitação {precipitation} mm. A projeção de 20 anos é educativa e usa uma tendência média global simplificada de +0,20 °C por década como referência.",
        defaultTagWater: "ÁGUA",
        defaultTagAdaptation: "ADAPTAÇÃO"
    },
    en: {
        today: "TODAY",
        selectPoint: "Select a point",
        onGlobe: "on the globe",
        climateMonitoring: "CLIMATE MONITORING",
        checkingForecast: "Checking forecast",
        loadingForecast: "Loading 7-day forecast...",
        checkingOpenMeteo: "CHECKING OPEN-METEO...",
        calculatingVariation: "calculating from variation",
        loadingContext: "Fetching current, historical and projected climate data for this location...",
        noForecast: "No forecast available",
        noForecastChart: "The chart could not be built right now.",
        forecastAverage: "Next days average: {value}",
        yearAverage: "{year} average: {value}",
        feelsLike: "FEELS LIKE {value}",
        pastAverage: "{year} average",
        futureAverage: "{year} projected average",
        unavailable: "Forecast unavailable",
        noConnection: "No connection to Open-Meteo.",
        fetchError: "ERROR FETCHING DATA",
        errorContext: "The API could not be reached right now. Check your internet connection and select the point again.",
        liveData: "LIVE DATA",
        clickPoint: "Open-Meteo · click a point",
        contextSuffix: "Current data and 7-day forecast come from Open-Meteo. Today: humidity {humidity}%, wind {wind} km/h and precipitation {precipitation} mm. The 20-year projection is educational and uses a simplified global average trend of +0.20 °C per decade as a reference.",
        defaultTagWater: "WATER",
        defaultTagAdaptation: "ADAPTATION"
    }
};

const regionLabels = {
    southAmerica: { pt: "AMÉRICA DO SUL", en: "SOUTH AMERICA" },
    northAmerica: { pt: "AMÉRICA DO NORTE", en: "NORTH AMERICA" },
    europe: { pt: "EUROPA", en: "EUROPE" },
    europeAsia: { pt: "EUROPA / ÁSIA", en: "EUROPE / ASIA" },
    africa: { pt: "ÁFRICA", en: "AFRICA" },
    asia: { pt: "ÁSIA", en: "ASIA" },
    centralAsia: { pt: "ÁSIA CENTRAL", en: "CENTRAL ASIA" },
    oceania: { pt: "OCEANIA", en: "OCEANIA" }
};

const tagLabels = {
    heat: { pt: "CALOR", en: "HEAT" },
    water: { pt: "ÁGUA", en: "WATER" },
    rain: { pt: "CHUVAS", en: "RAINFALL" },
    forests: { pt: "FLORESTAS", en: "FORESTS" },
    oceans: { pt: "OCEANOS", en: "OCEANS" },
    cities: { pt: "CIDADES", en: "CITIES" },
    air: { pt: "AR", en: "AIR" },
    mountains: { pt: "MONTANHAS", en: "MOUNTAINS" },
    ice: { pt: "GELO", en: "ICE" },
    drought: { pt: "SECA", en: "DROUGHT" },
    biodiversity: { pt: "BIODIVERSIDADE", en: "BIODIVERSITY" },
    steppes: { pt: "ESTEPES", en: "STEPPES" },
    fires: { pt: "INCÊNDIOS", en: "FIRES" },
    ecosystems: { pt: "ECOSSISTEMAS", en: "ECOSYSTEMS" },
    wind: { pt: "VENTOS", en: "WINDS" }
};

const cityContexts = {
    sp: { pt: "Grandes áreas urbanas precisam combinar adaptação, drenagem, arborização e redução de emissões para aumentar a resiliência.", en: "Large urban areas need to combine adaptation, drainage, tree cover and emission cuts to increase resilience." },
    manaus: { pt: "A Amazônia é estratégica para biodiversidade e ciclos de chuva; conservação e redução do desmatamento são fundamentais.", en: "The Amazon is strategic for biodiversity and rainfall cycles; conservation and lower deforestation are essential." },
    ny: { pt: "Cidades costeiras enfrentam riscos combinados de ondas de calor, chuvas extremas e elevação do nível do mar.", en: "Coastal cities face combined risks from heat waves, extreme rainfall and sea-level rise." },
    mexico: { pt: "Megacidades em altitude precisam lidar com calor, qualidade do ar, escassez hídrica e infraestrutura urbana resiliente.", en: "High-altitude megacities need to handle heat, air quality, water scarcity and resilient urban infrastructure." },
    london: { pt: "A adaptação urbana e sistemas de alerta ajudam a reduzir os impactos de eventos extremos e ondas de calor.", en: "Urban adaptation and warning systems help reduce the impacts of extreme events and heat waves." },
    sarajevo: { pt: "Regiões balcânicas combinam riscos de ondas de calor, poluição urbana e pressão sobre água e florestas.", en: "Balkan regions combine risks from heat waves, urban pollution and pressure on water and forests." },
    moscow: { pt: "Regiões russas observam aquecimento forte em altas latitudes, com impactos sobre neve, florestas boreais, solo congelado e infraestrutura.", en: "Russian regions are seeing strong high-latitude warming, affecting snow, boreal forests, frozen ground and infrastructure." },
    oslo: { pt: "Altas latitudes aquecem rapidamente, afetando gelo, ecossistemas, infraestrutura costeira e planejamento urbano.", en: "High latitudes are warming rapidly, affecting ice, ecosystems, coastal infrastructure and urban planning." },
    cairo: { pt: "O aumento do calor e a pressão sobre os recursos hídricos tornam adaptação, gestão da água e resiliência essenciais.", en: "Rising heat and pressure on water resources make adaptation, water management and resilience essential." },
    lagos: { pt: "Cidades costeiras tropicais podem enfrentar enchentes, calor úmido e pressão sobre moradia e saneamento.", en: "Tropical coastal cities may face flooding, humid heat and pressure on housing and sanitation." },
    capetown: { pt: "A segurança hídrica é central para adaptação climática em áreas sujeitas a secas e mudanças no regime de chuvas.", en: "Water security is central to climate adaptation in areas exposed to droughts and changing rainfall patterns." },
    nairobi: { pt: "Áreas do leste africano dependem de chuvas sazonais, conservação de savanas e proteção da biodiversidade para sustentar comunidades e agricultura.", en: "East African areas depend on seasonal rains, savanna conservation and biodiversity protection to sustain communities and agriculture." },
    dakar: { pt: "Cidades costeiras da África Ocidental enfrentam calor, erosão costeira, pressão hídrica e necessidade de adaptação urbana.", en: "West African coastal cities face heat, coastal erosion, water pressure and the need for urban adaptation." },
    mumbai: { pt: "Áreas costeiras e densamente povoadas podem precisar de infraestrutura resiliente e sistemas de alerta.", en: "Dense coastal areas may need resilient infrastructure and warning systems." },
    beijing: { pt: "Centros urbanos e industriais precisam reduzir emissões enquanto se adaptam a calor, água e eventos extremos.", en: "Urban and industrial centers need to cut emissions while adapting to heat, water stress and extreme events." },
    astana: { pt: "A Ásia Central enfrenta aquecimento continental, pressão sobre rios e estepes, secas sazonais e necessidade de adaptação agrícola.", en: "Central Asia faces continental warming, pressure on rivers and steppes, seasonal droughts and the need for agricultural adaptation." },
    bangkok: { pt: "Grandes cidades em deltas tropicais precisam lidar com enchentes, calor úmido, nível do mar e drenagem urbana.", en: "Large cities in tropical deltas need to handle flooding, humid heat, sea level and urban drainage." },
    seoul: { pt: "Regiões metropolitanas densas demandam redução de ilhas de calor, drenagem eficiente e planejamento energético resiliente.", en: "Dense metropolitan regions require lower heat islands, efficient drainage and resilient energy planning." },
    tokyo: { pt: "Planejamento urbano, infraestrutura resiliente e sistemas de alerta são importantes para reduzir riscos climáticos.", en: "Urban planning, resilient infrastructure and warning systems are important to reduce climate risks." },
    jakarta: { pt: "Elevação do mar, enchentes e subsidência tornam adaptação costeira uma prioridade de longo prazo.", en: "Sea-level rise, flooding and subsidence make coastal adaptation a long-term priority." },
    dubai: { pt: "Regiões áridas precisam combinar eficiência energética, resfriamento urbano e gestão de água em cenários mais quentes.", en: "Arid regions need to combine energy efficiency, urban cooling and water management in hotter scenarios." },
    sydney: { pt: "Mudanças de temperatura e secas podem aumentar riscos para ecossistemas e comunidades, exigindo adaptação.", en: "Temperature changes and droughts can increase risks for ecosystems and communities, requiring adaptation." },
    auckland: { pt: "Ilhas e áreas costeiras observam mudanças em chuva, tempestades e nível do mar, exigindo planejamento territorial.", en: "Islands and coastal areas are seeing changes in rainfall, storms and sea level, requiring land-use planning." },
    santiago: { pt: "Regiões andinas dependem de neve, rios e reservatórios que podem ser afetados por aquecimento e secas prolongadas.", en: "Andean regions depend on snow, rivers and reservoirs that can be affected by warming and prolonged droughts." }
};

const weatherCodeLabels = {
    0: { pt: "céu limpo", en: "clear sky" },
    1: { pt: "principalmente limpo", en: "mainly clear" },
    2: { pt: "parcialmente nublado", en: "partly cloudy" },
    3: { pt: "nublado", en: "overcast" },
    45: { pt: "neblina", en: "fog" },
    48: { pt: "neblina com geada", en: "depositing rime fog" },
    51: { pt: "garoa leve", en: "light drizzle" },
    53: { pt: "garoa moderada", en: "moderate drizzle" },
    55: { pt: "garoa intensa", en: "dense drizzle" },
    56: { pt: "garoa congelante", en: "freezing drizzle" },
    57: { pt: "garoa congelante intensa", en: "dense freezing drizzle" },
    61: { pt: "chuva leve", en: "slight rain" },
    63: { pt: "chuva moderada", en: "moderate rain" },
    65: { pt: "chuva forte", en: "heavy rain" },
    66: { pt: "chuva congelante", en: "freezing rain" },
    67: { pt: "chuva congelante forte", en: "heavy freezing rain" },
    71: { pt: "neve leve", en: "slight snow" },
    73: { pt: "neve moderada", en: "moderate snow" },
    75: { pt: "neve forte", en: "heavy snow" },
    77: { pt: "granizo de neve", en: "snow grains" },
    80: { pt: "pancadas leves", en: "slight rain showers" },
    81: { pt: "pancadas moderadas", en: "moderate rain showers" },
    82: { pt: "pancadas fortes", en: "violent rain showers" },
    85: { pt: "pancadas de neve", en: "snow showers" },
    86: { pt: "pancadas de neve fortes", en: "heavy snow showers" },
    95: { pt: "trovoada", en: "thunderstorm" },
    96: { pt: "trovoada com granizo leve", en: "thunderstorm with slight hail" },
    99: { pt: "trovoada com granizo forte", en: "thunderstorm with heavy hail" }
};

const riskLabels = {
    insufficient: { level: "--", text: { pt: "dados insuficientes", en: "insufficient data" } },
    extreme: { level: { pt: "EXTREMO", en: "EXTREME" }, text: { pt: "ritmo acima da meta de segurança climática", en: "pace above the climate safety target" } },
    high: { level: { pt: "ALTO", en: "HIGH" }, text: { pt: "0,20 °C por década já é aquecimento acelerado", en: "0.20 °C per decade is already accelerated warming" } },
    moderate: { level: { pt: "MODERADO", en: "MODERATE" }, text: { pt: "aquecimento ainda exige adaptação", en: "warming still requires adaptation" } },
    low: { level: { pt: "BAIXO", en: "LOW" }, text: { pt: "ritmo menor, mas ainda precisa monitoramento", en: "slower pace, but still needs monitoring" } }
};

const metricLabels = {
    moderatePressure: { pt: "pressão moderada", en: "moderate pressure" },
    lowLocalImpact: { pt: "baixo impacto local", en: "low local impact" },
    sensitive: { pt: "sensível", en: "sensitive" },
    urbanPlanning: { pt: "planejamento urbano", en: "urban planning" },
    rainfallCycle: { pt: "ciclo de chuvas", en: "rainfall cycle" },
    highPressure: { pt: "pressão alta", en: "high pressure" },
    veryHigh: { pt: "muito alta", en: "very high" },
    conservation: { pt: "conservação", en: "conservation" },
    highRisk: { pt: "risco alto", en: "high risk" },
    waterManagement: { pt: "gestão hídrica", en: "water management" },
    coastalFloods: { pt: "enchentes costeiras", en: "coastal flooding" },
    mangrovesCoasts: { pt: "mangues/costas", en: "mangroves/coasts" },
    coastalDefense: { pt: "defesa costeira", en: "coastal defense" },
    thawAndRivers: { pt: "degelo e rios", en: "thaw and rivers" },
    borealForest: { pt: "floresta boreal", en: "boreal forest" },
    highLatitude: { pt: "alta latitude", en: "high latitude" },
    coldInfrastructure: { pt: "infraestrutura fria", en: "cold-region infrastructure" },
    heatIslands: { pt: "ilhas de calor", en: "heat islands" },
    drainageShade: { pt: "drenagem e sombra", en: "drainage and shade" },
    keyEcosystems: { pt: "ecossistemas-chave", en: "key ecosystems" }
};

function monitorLanguage() {
    return window.CLIMATE13_I18N?.language === "en" ? "en" : "pt";
}

function monitorLocale() {
    return monitorLanguage() === "en" ? "en-US" : "pt-BR";
}

function mt(key, replacements = {}) {
    const value = monitorText[monitorLanguage()][key] || monitorText.pt[key] || key;
    return Object.entries(replacements).reduce(
        (text, [name, replacement]) => text.replaceAll(`{${name}}`, replacement),
        value
    );
}

function labelFrom(map, key) {
    return map[key]?.[monitorLanguage()] || map[key]?.pt || key;
}

function countryName(city) {
    if (!city.countryCode || typeof Intl.DisplayNames === "undefined") return city.country;
    return new Intl.DisplayNames([monitorLocale()], { type: "region" }).of(city.countryCode) || city.country;
}

function formatMonitorNumber(value, options = {}) {
    return Number.isFinite(value)
        ? new Intl.NumberFormat(monitorLocale(), options).format(value)
        : "--";
}

function updateMonitorClock() {
    monitorClock.textContent = new Date().toLocaleTimeString(monitorLocale());
}

function openClimateMonitor() {
    monitorOverlay.classList.add("active");
    document.body.classList.add("monitor-open");

    setTimeout(() => {
        if (!globeInitialized) {
            initClimateGlobe();
        } else {
            resizeClimateGlobe();
        }
    }, 40);
}

monitorBtn.addEventListener("click", openClimateMonitor);
monitorOpenLinks.forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();
        openClimateMonitor();
    });
});

closeMonitor.addEventListener("click", closeClimateMonitor);
closeMonitorInfo?.addEventListener("click", () => {
    document.getElementById("monitorInfo")?.classList.remove("active");
});

monitorOverlay.addEventListener("click", event => {
    if (event.target === monitorOverlay) {
        closeClimateMonitor();
    }
});

function closeClimateMonitor() {
    monitorOverlay.classList.remove("active");
    document.body.classList.remove("monitor-open");
    document.getElementById("monitorInfo")?.classList.remove("active");
}

setInterval(updateMonitorClock, 1000);
updateMonitorClock();

function latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;

    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

function createGlowTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;

    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);

    gradient.addColorStop(0, "rgba(120,255,180,1)");
    gradient.addColorStop(.15, "rgba(99,255,156,.9)");
    gradient.addColorStop(.4, "rgba(98,245,255,.35)");
    gradient.addColorStop(1, "rgba(98,245,255,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);

    return new THREE.CanvasTexture(canvas);
}

function createBeam(city, radius) {
    const surface = latLonToVector3(city.lat, city.lon, radius + 0.015);
    const outer = latLonToVector3(city.lat, city.lon, radius + 0.34);

    const direction = new THREE.Vector3().subVectors(outer, surface);
    const length = direction.length();

    const beamGeometry = new THREE.CylinderGeometry(
        0.018, 0.055, length, 8, 1, true
    );

    const beamMaterial = new THREE.MeshBasicMaterial({
        color: 0x63ff9c,
        transparent: true,
        opacity: 0.42,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const beam = new THREE.Mesh(beamGeometry, beamMaterial);
    beam.position.copy(surface).add(outer).multiplyScalar(.5);
    beam.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.normalize()
    );

    beam.userData = {
        type: "beam",
        cityId: city.id
    };

    const point = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 12, 12),
        new THREE.MeshBasicMaterial({
            color: 0x9affbd
        })
    );

    point.position.copy(surface);
    point.userData = {
        type: "city",
        cityId: city.id
    };

    const glow = new THREE.Sprite(
        new THREE.SpriteMaterial({
            map: createGlowTexture(),
            color: 0x63ff9c,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })
    );

    glow.scale.set(.48, .48, .48);
    glow.position.copy(surface);
    glow.userData = {
        type: "city",
        cityId: city.id
    };

    globeGroup.add(beam);
    globeGroup.add(point);
    globeGroup.add(glow);
}

function initClimateGlobe() {
    const container = document.getElementById("globeContainer");

    if (!container || typeof THREE === "undefined") {
        console.error("Three.js não foi carregado.");
        return;
    }

    globeInitialized = true;

    globeScene = new THREE.Scene();

    globeCamera = new THREE.PerspectiveCamera(
        42,
        container.clientWidth / container.clientHeight,
        .1,
        100
    );

    globeCamera.position.set(0, 0, 4.15);

    globeRenderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    globeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    globeRenderer.setSize(container.clientWidth, container.clientHeight);
    globeRenderer.outputColorSpace = THREE.SRGBColorSpace;

    container.innerHTML = "";
    container.appendChild(globeRenderer.domElement);

    globeGroup = new THREE.Group();
    globeScene.add(globeGroup);

    const ambient = new THREE.AmbientLight(0x8affb2, 1.3);
    globeScene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0x9fffff, 2.8);
    keyLight.position.set(-3, 2, 4);
    globeScene.add(keyLight);

    const globeRadius = 1.86;

    const textureLoader = new THREE.TextureLoader();

    const earthTexture = textureLoader.load(
        "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"
    );

    earthTexture.colorSpace = THREE.SRGBColorSpace;

    const earth = new THREE.Mesh(
        new THREE.SphereGeometry(globeRadius, 64, 64),
        new THREE.MeshPhongMaterial({
            map: earthTexture,
            shininess: 18,
            specular: new THREE.Color(0x164f31)
        })
    );

    globeGroup.add(earth);

    const atmosphere = new THREE.Mesh(
        new THREE.SphereGeometry(globeRadius * 1.035, 64, 64),
        new THREE.MeshBasicMaterial({
            color: 0x63ff9c,
            transparent: true,
            opacity: .055,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
        })
    );

    globeGroup.add(atmosphere);

    const gridMaterial = new THREE.LineBasicMaterial({
        color: 0x63ff9c,
        transparent: true,
        opacity: .07
    });

    for (let lat = -60; lat <= 60; lat += 20) {
        const points = [];

        for (let lon = -180; lon <= 180; lon += 4) {
            points.push(latLonToVector3(lat, lon, globeRadius + .012));
        }

        globeGroup.add(
            new THREE.Line(
                new THREE.BufferGeometry().setFromPoints(points),
                gridMaterial
            )
        );
    }

    for (let lon = -180; lon < 180; lon += 20) {
        const points = [];

        for (let lat = -90; lat <= 90; lat += 4) {
            points.push(latLonToVector3(lat, lon, globeRadius + .012));
        }

        globeGroup.add(
            new THREE.Line(
                new THREE.BufferGeometry().setFromPoints(points),
                gridMaterial
            )
        );
    }

    climateCities.forEach(city => createBeam(city, globeRadius));

    globeRaycaster = new THREE.Raycaster();
    globeMouse = new THREE.Vector2();

    container.addEventListener("pointerdown", onGlobePointerDown);
    window.addEventListener("pointermove", onGlobePointerMove);
    window.addEventListener("pointerup", onGlobePointerUp);
    container.addEventListener("wheel", onGlobeWheel, { passive: false });
    container.addEventListener("click", onGlobeClick);

    globeResizeObserver = new ResizeObserver(resizeClimateGlobe);
    globeResizeObserver.observe(container);

    animateClimateGlobe();
}

function onGlobePointerDown(event) {
    globeDrag = true;
    globeDragged = false;
    globeLastX = event.clientX;
    globeLastY = event.clientY;
}

function onGlobePointerMove(event) {
    if (!globeDrag || !globeGroup) return;

    const dx = event.clientX - globeLastX;
    const dy = event.clientY - globeLastY;

    if (Math.abs(dx) + Math.abs(dy) > 2) {
        globeDragged = true;
    }

    globeGroup.rotation.y += dx * .006;
    globeGroup.rotation.x += dy * .004;

    globeGroup.rotation.x = Math.max(
        -Math.PI / 2.2,
        Math.min(Math.PI / 2.2, globeGroup.rotation.x)
    );

    globeLastX = event.clientX;
    globeLastY = event.clientY;
}

function onGlobePointerUp() {
    globeDrag = false;
}

function onGlobeWheel(event) {
    event.preventDefault();

    globeZoom += event.deltaY * -0.001;
    globeZoom = Math.max(.42, Math.min(1.62, globeZoom));

    globeCamera.position.z = 4.15 / globeZoom;
}

function onGlobeClick(event) {
    if (globeDragged) return;

    const rect = globeRenderer.domElement.getBoundingClientRect();

    globeMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    globeMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    globeRaycaster.setFromCamera(globeMouse, globeCamera);

    const objects = globeGroup.children.filter(
        object => object.userData && object.userData.cityId
    );

    const hits = globeRaycaster.intersectObjects(objects, true);

    if (hits.length) {
        const cityId = hits[0].object.userData.cityId;
        const city = climateCities.find(item => item.id === cityId);

        if (city) {
            selectClimateCity(city);
            pulseSelectedCity(cityId);
        }
    }
}

function pulseSelectedCity(cityId) {
    const selected = globeGroup.children.find(
        object =>
            object.userData &&
            object.userData.cityId === cityId &&
            object.userData.type === "city" &&
            object.material &&
            object.material.color
    );

    if (!selected) return;

    const original = selected.scale.x;
    selected.scale.setScalar(original * 1.8);

    setTimeout(() => {
        selected.scale.setScalar(original);
    }, 260);
}

function climateRiskFromDelta(delta) {
    if (!Number.isFinite(delta)) {
        return { key: "insufficient" };
    }

    if (delta >= .30) return { key: "extreme" };
    if (delta >= .20) return { key: "high" };
    if (delta >= .10) return { key: "moderate" };
    return { key: "low" };
}

function riskLevelLabel(risk) {
    const label = riskLabels[risk.key]?.level;
    if (typeof label === "string") return label;
    return label?.[monitorLanguage()] || "--";
}

function riskTextLabel(risk) {
    return riskLabels[risk.key]?.text?.[monitorLanguage()] || "--";
}

function formatTemp(value) {
    return Number.isFinite(value)
        ? `${formatMonitorNumber(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}°C`
        : "--°C";
}

function weatherCodeLabel(code) {
    return weatherCodeLabels[code]?.[monitorLanguage()] || (
        monitorLanguage() === "en" ? "unknown condition" : "condição não identificada"
    );
}

function formatForecastDay(value, index) {
    if (!value) return index === 0 ? mt("today") : `D+${index}`;

    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return index === 0 ? mt("today") : `D+${index}`;

    if (index === 0) return mt("today");

    return new Intl.DateTimeFormat(monitorLocale(), { weekday: "short" })
        .format(date)
        .replace(".", "")
        .toUpperCase();
}

function setForecastEmpty(message) {
    const chart = document.getElementById("forecastChart");
    if (!chart) return;

    const empty = document.createElement("span");
    empty.className = "forecast-empty";
    empty.textContent = message;
    chart.replaceChildren(empty);
}

function renderForecastChart(forecast) {
    const chart = document.getElementById("forecastChart");
    const summary = document.getElementById("forecastSummary");

    if (!chart || !summary) return;

    const days = (forecast?.time || [])
        .map((time, index) => ({
            time,
            max: forecast.max?.[index],
            min: forecast.min?.[index],
            mean: forecast.mean?.[index],
            weather: weatherCodeLabel(forecast.weatherCode?.[index])
        }))
        .filter(day =>
            Number.isFinite(day.max) &&
            Number.isFinite(day.min) &&
            Number.isFinite(day.mean)
        )
        .slice(0, 7);

    if (!days.length) {
        summary.textContent = mt("noForecast");
        setForecastEmpty(mt("noForecastChart"));
        return;
    }

    const minTemp = Math.min(...days.map(day => day.min));
    const maxTemp = Math.max(...days.map(day => day.max));
    const range = Math.max(maxTemp - minTemp, 1);
    const avg = days.reduce((sum, day) => sum + day.mean, 0) / days.length;

    summary.textContent = mt("forecastAverage", { value: formatTemp(avg) });

    const nodes = days.map((day, index) => {
        const barHeight = 28 + ((day.mean - minTemp) / range) * 58;
        const offset = ((day.min - minTemp) / range) * 26;

        const dayNode = document.createElement("div");
        dayNode.className = `forecast-day ${index === 0 ? "is-today" : ""}`;

        const label = document.createElement("strong");
        label.textContent = formatForecastDay(day.time, index);

        const bar = document.createElement("div");
        bar.className = "forecast-bar";
        bar.title = day.weather;

        const fill = document.createElement("span");
        fill.style.height = `${barHeight.toFixed(1)}%`;
        fill.style.transform = `translateY(-${offset.toFixed(1)}%)`;
        bar.appendChild(fill);

        const mean = document.createElement("em");
        mean.textContent = formatTemp(day.mean);

        const rangeLabel = document.createElement("small");
        rangeLabel.textContent = `${formatTemp(day.min)} / ${formatTemp(day.max)}`;

        dayNode.append(label, bar, mean, rangeLabel);
        return dayNode;
    });

    chart.replaceChildren(...nodes);
}

function environmentalMetrics(city) {
    const tagSet = new Set(city.tags);

    const profile = {
        water: "moderatePressure",
        forest: "lowLocalImpact",
        biodiversity: "sensitive",
        adaptation: "urbanPlanning"
    };

    if (city.id === "manaus" || tagSet.has("forests")) {
        profile.water = "rainfallCycle";
        profile.forest = "highPressure";
        profile.biodiversity = "veryHigh";
        profile.adaptation = "conservation";
    }

    if (tagSet.has("drought") || tagSet.has("water") || ["cairo", "dubai", "capetown"].includes(city.id)) {
        profile.water = "highRisk";
        profile.adaptation = "waterManagement";
    }

    if (tagSet.has("oceans") || ["mumbai", "lagos", "jakarta", "dakar", "bangkok"].includes(city.id)) {
        profile.water = "coastalFloods";
        profile.biodiversity = "mangrovesCoasts";
        profile.adaptation = "coastalDefense";
    }

    if (tagSet.has("ice") || ["moscow", "oslo"].includes(city.id)) {
        profile.water = "thawAndRivers";
        profile.forest = "borealForest";
        profile.biodiversity = "highLatitude";
        profile.adaptation = "coldInfrastructure";
    }

    if (tagSet.has("cities") || tagSet.has("air")) {
        profile.forest = "heatIslands";
        profile.adaptation = "drainageShade";
    }

    if (tagSet.has("biodiversity") || city.id === "nairobi") {
        profile.biodiversity = "keyEcosystems";
    }

    return profile;
}

async function selectClimateCity(city) {
    selectedClimateCity = city;
    selectedClimateData = null;
    document.getElementById("monitorInfo")?.classList.add("active");

    document.getElementById("monitorCode").textContent =
        `${city.countryCode === "BR" ? "BR" : "GLB"} / ${String(climateCities.indexOf(city) + 1).padStart(2, "0")}`;

    document.getElementById("monitorCity").textContent = city.city;
    document.getElementById("monitorCountry").textContent = countryName(city);
    document.getElementById("monitorCoords").textContent =
        `${Math.abs(city.lat).toFixed(2)}° ${city.lat >= 0 ? "N" : "S"} / ${Math.abs(city.lon).toFixed(2)}° ${city.lon >= 0 ? "E" : "W"}`;
    document.getElementById("monitorRegion").textContent = labelFrom(regionLabels, city.region);

    ["monitorTemp", "monitorYearAvg", "monitorPast", "monitorFuture", "monitorDelta", "monitorWater", "monitorForest", "monitorBiodiversity", "monitorAdaptation"].forEach(id => {
        document.getElementById(id).textContent = "...";
    });
    document.getElementById("forecastSummary").textContent = mt("checkingForecast");
    setForecastEmpty(mt("loadingForecast"));
    document.getElementById("monitorWeather").textContent = mt("checkingOpenMeteo");
    document.getElementById("monitorRisk").textContent = "...";
    document.getElementById("monitorRiskText").textContent = mt("calculatingVariation");
    document.getElementById("monitorContext").textContent = mt("loadingContext");

    document.getElementById("tagHeat").textContent = labelFrom(tagLabels, city.tags[0]);
    document.getElementById("tagWater").textContent = city.tags[1] ? labelFrom(tagLabels, city.tags[1]) : mt("defaultTagWater");
    document.getElementById("tagExtreme").textContent = city.tags[2] ? labelFrom(tagLabels, city.tags[2]) : mt("defaultTagAdaptation");

    try {
        const data = await fetchClimateData(city);
        selectedClimateData = data;
        renderSelectedClimateCity();
    } catch (error) {
        console.error("Erro ao consultar Open-Meteo:", error);
        document.getElementById("monitorWeather").textContent = mt("fetchError");
        document.getElementById("forecastSummary").textContent = mt("unavailable");
        setForecastEmpty(mt("noConnection"));
        document.getElementById("monitorContext").textContent = mt("errorContext");
    }
}

function renderSelectedClimateCity() {
    const city = selectedClimateCity;
    const data = selectedClimateData;
    if (!city) return;

    document.getElementById("monitorCode").textContent =
        `${city.countryCode === "BR" ? "BR" : "GLB"} / ${String(climateCities.indexOf(city) + 1).padStart(2, "0")}`;
    document.getElementById("monitorCity").textContent = city.city;
    document.getElementById("monitorCountry").textContent = countryName(city);
    document.getElementById("monitorRegion").textContent = labelFrom(regionLabels, city.region);
    document.getElementById("tagHeat").textContent = labelFrom(tagLabels, city.tags[0]);
    document.getElementById("tagWater").textContent = city.tags[1] ? labelFrom(tagLabels, city.tags[1]) : mt("defaultTagWater");
    document.getElementById("tagExtreme").textContent = city.tags[2] ? labelFrom(tagLabels, city.tags[2]) : mt("defaultTagAdaptation");

    if (!data) {
        document.getElementById("forecastSummary").textContent = mt("checkingForecast");
        setForecastEmpty(mt("loadingForecast"));
        document.getElementById("monitorWeather").textContent = mt("checkingOpenMeteo");
        document.getElementById("monitorRiskText").textContent = mt("calculatingVariation");
        document.getElementById("monitorContext").textContent = mt("loadingContext");
        return;
    }

    const deltaPerDecade = data.warmingPerDecade;
    const risk = climateRiskFromDelta(deltaPerDecade);
    const metrics = environmentalMetrics(city);
    const context = cityContexts[city.context]?.[monitorLanguage()] || cityContexts[city.context]?.pt || "";
    const humidity = formatMonitorNumber(data.humidity, { maximumFractionDigits: 0 });
    const wind = formatMonitorNumber(data.wind, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const precipitation = formatMonitorNumber(data.precipitation, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const delta = Number.isFinite(deltaPerDecade)
        ? `+${formatMonitorNumber(deltaPerDecade, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}°C/déc.`
        : "--";

    document.getElementById("monitorTemp").textContent = formatTemp(data.current);
    document.getElementById("monitorYearAvg").textContent = mt("yearAverage", { year: data.reportYear, value: formatTemp(data.currentYearAverage) });
    document.getElementById("monitorWeather").textContent =
        `${weatherCodeLabel(data.weatherCode).toUpperCase()} · ${mt("feelsLike", { value: formatTemp(data.apparent) })}`;
    document.getElementById("monitorPast").textContent = formatTemp(data.past);
    document.getElementById("monitorFuture").textContent = formatTemp(data.future20);
    document.getElementById("monitorDelta").textContent = delta;
    document.getElementById("monitorRisk").textContent = riskLevelLabel(risk);
    document.getElementById("monitorRiskText").textContent = riskTextLabel(risk);
    document.getElementById("monitorPastLabel").textContent = mt("pastAverage", { year: data.pastYear });
    document.getElementById("monitorFutureLabel").textContent = mt("futureAverage", { year: data.future20Year });
    document.getElementById("monitorWater").textContent = labelFrom(metricLabels, metrics.water);
    document.getElementById("monitorForest").textContent = labelFrom(metricLabels, metrics.forest);
    document.getElementById("monitorBiodiversity").textContent = labelFrom(metricLabels, metrics.biodiversity);
    document.getElementById("monitorAdaptation").textContent = labelFrom(metricLabels, metrics.adaptation);
    renderForecastChart(data.forecast);

    document.getElementById("monitorContext").textContent =
        `${context} ${mt("contextSuffix", { humidity, wind, precipitation })}`;

    const liveLabel = document.querySelector(".monitor-live");
    if (liveLabel) {
        const dot = document.createElement("span");
        dot.className = "status-dot";
        const small = document.createElement("small");
        small.textContent = `Open-Meteo · ${new Date(data.updatedAt).toLocaleString(monitorLocale())}`;
        liveLabel.replaceChildren(dot, document.createTextNode(` ${mt("liveData")} `), small);
    }
}

function updateMonitorLanguage() {
    updateMonitorClock();

    if (selectedClimateCity) {
        renderSelectedClimateCity();
        return;
    }

    document.getElementById("monitorCity").textContent = mt("selectPoint");
    document.getElementById("monitorCountry").textContent = mt("onGlobe");
    document.getElementById("monitorRegion").textContent = mt("climateMonitoring");
    document.getElementById("forecastSummary").textContent = mt("selectPoint");
    setForecastEmpty(monitorLanguage() === "en" ? "Waiting for Open-Meteo data" : "Aguardando dados da Open-Meteo");

    const liveLabel = document.querySelector(".monitor-live");
    if (liveLabel) {
        const dot = document.createElement("span");
        dot.className = "status-dot";
        const small = document.createElement("small");
        small.textContent = mt("clickPoint");
        liveLabel.replaceChildren(dot, document.createTextNode(` ${mt("liveData")} `), small);
    }
}

window.addEventListener("climate13:languagechange", updateMonitorLanguage);

function resizeClimateGlobe() {
    if (!globeRenderer || !globeCamera) return;

    const container = document.getElementById("globeContainer");

    if (!container || !container.clientWidth || !container.clientHeight) return;

    globeCamera.aspect = container.clientWidth / container.clientHeight;
    globeCamera.updateProjectionMatrix();

    globeRenderer.setSize(
        container.clientWidth,
        container.clientHeight
    );
}

function animateClimateGlobe() {
    globeAnimationFrame = requestAnimationFrame(animateClimateGlobe);

    if (!globeRenderer || !globeScene || !globeCamera) return;

    if (!globeDrag && globeGroup) {
        globeGroup.rotation.y += .00055;
    }

    globeRenderer.render(globeScene, globeCamera);
}


