// 平野の浜（山中湖）の天気データ取得と、訪客向けアドバイス生成
// Open-Meteo を使用（API キー不要）。サーバー側（ビルド時）で取得し、
// クライアント側でも再取得して最新化する。
// 参考座標：平野の浜 35.4247, 138.9008

export interface WeatherNow {
  temp: number;
  apparent: number;
  humidity: number;
  wind: number; // m/s
  code: number;
  precipProb: number;
  isDay: number;
  uvIndex: number;
}

export interface WeatherDay {
  date: string;
  weekday: string;
  code: number;
  tmax: number;
  tmin: number;
  precipProb: number;
  sunrise: string;
  sunset: string;
  windMax: number;
}

export interface WeatherAlert {
  event: string;
  severity?: string;
}

export interface WeatherData {
  current: WeatherNow;
  daily: WeatherDay[];
  alerts: WeatherAlert[];
  fetchedAt: string;
}

export interface Advice {
  outfit: string[];
  activities: string[];
  items: string[];
  risks: string[];
}

const LAT = 35.4247;
const LON = 138.9008;

export const WMO: Record<number, { label: string; icon: string }> = {
  0: { label: '晴れ', icon: '☀️' },
  1: { label: '大体晴れ', icon: '🌤️' },
  2: { label: '一部曇り', icon: '⛅' },
  3: { label: '曇り', icon: '☁️' },
  45: { label: '霧', icon: '🌫️' },
  48: { label: '霧氷', icon: '🌫️' },
  51: { label: '弱い霧雨', icon: '🌦️' },
  53: { label: '霧雨', icon: '🌦️' },
  55: { label: '強い霧雨', icon: '🌧️' },
  56: { label: '凍雨', icon: '🌧️' },
  57: { label: '強い凍雨', icon: '🌧️' },
  61: { label: '弱い雨', icon: '🌦️' },
  63: { label: '雨', icon: '🌧️' },
  65: { label: '強い雨', icon: '🌧️' },
  66: { label: '凍雨', icon: '🌧️' },
  67: { label: '強い凍雨', icon: '🌧️' },
  71: { label: '弱い雪', icon: '🌨️' },
  73: { label: '雪', icon: '🌨️' },
  75: { label: '強い雪', icon: '❄️' },
  77: { label: '雪粒', icon: '🌨️' },
  80: { label: 'にわか雨', icon: '🌦️' },
  81: { label: 'にわか雨', icon: '🌧️' },
  82: { label: '激しいにわか雨', icon: '⛈️' },
  85: { label: '弱い雪', icon: '🌨️' },
  86: { label: '強い雪', icon: '❄️' },
  95: { label: '雷雨', icon: '⛈️' },
  96: { label: '雹を伴う雷雨', icon: '⛈️' },
  99: { label: '強い雹雷雨', icon: '⛈️' },
};

export function describeCode(code: number): { label: string; icon: string } {
  return WMO[code] ?? { label: '—', icon: '🌡️' };
}

export function buildUrl(): string {
  const params = new URLSearchParams({
    latitude: String(LAT),
    longitude: String(LON),
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day,precipitation_probability,uv_index',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,wind_speed_10m_max',
    timezone: 'Asia/Tokyo',
    forecast_days: '7',
  });
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

export function alertsUrl(): string {
  return `https://api.open-meteo.com/v1/alerts?latitude=${LAT}&longitude=${LON}`;
}

export function parseForecast(j: any): { current: WeatherNow; daily: WeatherDay[] } {
  const c = j.current;
  const d = j.daily;
  const daily: WeatherDay[] = (d.time as string[]).map((date: string, i: number) => ({
    date,
    weekday: new Date(`${date}T00:00:00`).toLocaleDateString('ja-JP', { weekday: 'short' }),
    code: d.weather_code[i],
    tmax: Math.round(d.temperature_2m_max[i]),
    tmin: Math.round(d.temperature_2m_min[i]),
    precipProb: d.precipitation_probability_max[i] ?? 0,
    sunrise: String(d.sunrise[i]).slice(11, 16),
    sunset: String(d.sunset[i]).slice(11, 16),
    windMax: Math.round(d.wind_speed_10m_max[i]),
  }));
  return {
    current: {
      temp: Math.round(c.temperature_2m),
      apparent: Math.round(c.apparent_temperature),
      humidity: c.relative_humidity_2m,
      wind: Math.round(c.wind_speed_10m),
      code: c.weather_code,
      precipProb: c.precipitation_probability ?? 0,
      isDay: c.is_day,
      uvIndex: c.uv_index ?? 0,
    },
    daily,
  };
}

export async function fetchAlerts(): Promise<WeatherAlert[]> {
  try {
    const res = await fetch(alertsUrl());
    if (!res.ok) return [];
    const j: any = await res.json();
    const feats: any[] = j.features ?? [];
    const seen = new Set<string>();
    const out: WeatherAlert[] = [];
    for (const f of feats) {
      const p = f.properties ?? {};
      const event = p.event || p.headline || '';
      if (!event || seen.has(event)) continue;
      seen.add(event);
      out.push({ event, severity: p.severity });
    }
    return out;
  } catch {
    return [];
  }
}

// サーバー側（ビルド時）で呼び出す。失敗時は null を返し、クライアント側で補完する。
export async function fetchWeather(): Promise<WeatherData | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(buildUrl(), { signal: ctrl.signal });
    if (!res.ok) return null;
    const j: any = await res.json();
    const { current, daily } = parseForecast(j);
    let alerts: WeatherAlert[] = [];
    try {
      alerts = await fetchAlerts();
    } catch {
      alerts = [];
    }
    return { current, daily, alerts, fetchedAt: new Date().toISOString() };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// 天気データから、訪客がそのまま行動に使えるアドバイスを組み立てる。
// 条件に合致したものだけを出力し、該当しない項目は表示しない（動的レンダリング）。
export function buildAdvice(
  now: WeatherNow,
  day: WeatherDay | undefined,
  alerts: WeatherAlert[]
): Advice {
  const outfit: string[] = [];
  const activities: string[] = [];
  const items: string[] = [];
  const risks: string[] = [];

  const tmax = day ? day.tmax : now.temp;
  const tmin = day ? day.tmin : now.temp;
  const range = tmax - tmin;
  const wind = now.wind;
  const uv = now.uvIndex;
  const prob = now.precipProb;
  const code = now.code;

  const heavy = [65, 67, 82, 75, 86, 99, 96].includes(code);
  const moderate = [63, 55, 57, 73, 81].includes(code);
  const isThunder = code >= 95;
  const isSnow = [71, 73, 75, 77, 85, 86].includes(code);
  const isFog = [45, 48].includes(code);
  const isRain = (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || isThunder;
  const isSunny = code <= 2;
  const isCloudy = code === 3;

  // リスク（該当時のみ表示、赤色で目立たせる）
  for (const a of alerts) {
    risks.push(
      `【気象予警】${a.event} が発表されています。山や湖岸などの危険な場所へはできるだけ行かず、天気の変化に注意してください。`
    );
  }
  if (isThunder) {
    risks.push('雷が予想されます。登山や湖での水遊び、木の下での待機は避けてください。');
  }
  if (wind >= 13.9) {
    risks.push('風が強い日です。広告看板や湖岸の岩場から離れ、湖上のアクティビティは中止になりやすいです。');
  }
  if (isFog) {
    risks.push('濃霧で視界が悪くなります。運転や岸辺の歩行には注意し、富士山や湖の景観は見えにくくなります。');
  }
  if (heavy && isRain) {
    risks.push('雨が強くなります。谷や低い土地を避け、遊覧船やロープウェイは運休の可能性があります。');
  }

  // 服装・過ごし方
  if (tmax >= 32) {
    outfit.push('気温が高いので、正午の外出は避けて涼しい時間を選びましょう。');
  }
  if (tmax <= 10) {
    outfit.push('気温が低いので、しっかり防寒を。厚手のコートやマフラーがあると安心です。');
  }
  if (range > 8) {
    outfit.push('昼夜の温差が大きいので、羽織れる一枚があると調節しやすいです。');
  }
  if (isRain && (heavy || moderate)) {
    outfit.push('雨が降るので、撥水加工のアウターがおすすめです。');
  }
  if (isSnow) {
    outfit.push('雪や凍結があるので、滑りにくい靴でお出かけを。');
  }
  if (isFog) {
    outfit.push('朝の冷え込みで霧が出やすいので、少し厚手の上着を。');
  }
  if (now.humidity >= 80 && tmax >= 28) {
    outfit.push('蒸し暑さが続くので、通気性の良い服装で。');
  }

  // 楽しみ方（屋外・湖岸・山の視点を含める）
  if (isThunder) {
    activities.push('水上のアクティビティはほぼ中止です。室内施設や車内からの観賞に切り替えましょう。');
  } else if (heavy && isRain) {
    activities.push('屋外の散策は控え、美術館や周辺の屋内施設がおすすめです。湖岸の遊覧船は運休の可能性があります。');
  } else if (wind >= 13.9) {
    activities.push('湖上の船や岸辺の高い波に注意。風を避けられる場所でのんびり過ごしましょう。');
  } else if (isRain) {
    activities.push('小雨です。路面が滑りやすいので足元に注意。露天のアクティビティは体感が悪くなります。');
  } else if (isFog) {
    activities.push('富士山は見えにくくなります。景観より散策や写真は別日に。');
  } else if (tmax >= 32) {
    activities.push('屋外は短めに。朝や夕方の涼しい時間に湖岸を散策しましょう。');
  } else if (tmax <= 10) {
    activities.push('屋外は時間を短く、温かい室内で休憩をはさみましょう。');
  } else if (isSunny) {
    activities.push('天気が良く、外でのんびり過ごせます。日の出・日の入りの風景もおすすめです。');
  } else if (isCloudy) {
    activities.push('光が柔らかく、写真撮影に適しています。長時間の屋外散策も快適です。');
  } else {
    activities.push('湖岸の散策や富士山の観賞を楽しめます。');
  }

  // 持ち物（該当するものだけ）
  if (prob >= 60 || isRain) {
    items.push('折りたたみ傘 / レインウェア（降水の可能性があります）');
  }
  if ((heavy && isRain) || wind >= 13.9) {
    items.push('長い傘は風で使いにくいので、レインコートがおすすめ');
  }
  if (tmax >= 32 || uv >= 5) {
    items.push('日焼け止め、サングラス、帽子');
  }
  if (tmax >= 32) {
    items.push('十分な飲み物、熱中症対策');
  }
  if (tmax <= 10) {
    items.push('厚手のコート、マフラー');
  }
  if (range > 8) {
    items.push('羽織れる上着');
  }
  if (isSnow) {
    items.push('滑り止め靴、手袋');
  }
  if (wind >= 10.8) {
    items.push('帽子が飛ばされやすいので紐付きを。ゆったりしたロングスカートは歩きにくいです。');
  }
  if (now.humidity >= 80 && tmax >= 28) {
    items.push('汗拭きタオル、着替え');
  }

  return { outfit, activities, items, risks };
}

function esc(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string;
  });
}

// 天気カード本体の HTML を生成（サーバー側とクライアント側で共通利用）
export function renderWeatherHTML(data: WeatherData): string {
  const cur = data.current;
  const now = describeCode(cur.code);
  const advice = buildAdvice(cur, data.daily[0], data.alerts || []);

  const risksHTML = advice.risks.length
    ? `<div class="weather-risk">${advice.risks.map((r) => `<p>${esc(r)}</p>`).join('')}</div>`
    : '';

  const tabsDef = [
    ['outfit', '服装・過ごし方', advice.outfit],
    ['activities', '楽しみ方', advice.activities],
    ['items', '持ち物', advice.items],
  ].filter((d) => (d[2] as string[]).length > 0);

  const tabBtns = tabsDef
    .map(
      (d, i) =>
        `<button type="button" class="weather-tab${i === 0 ? ' is-active' : ''}" data-key="${d[0]}">${d[1]}</button>`
    )
    .join('');
  const tabPanels = tabsDef
    .map(
      (d, i) =>
        `<div class="weather-panel${i === 0 ? ' is-active' : ''}" data-key="${d[0]}"><ul>${(d[2] as string[])
          .map((x) => `<li>${esc(x)}</li>`)
          .join('')}</ul></div>`
    )
    .join('');
  const adviceHTML = tabsDef.length
    ? `<div class="weather-advice"><div class="weather-tabs">${tabBtns}</div>${tabPanels}</div>`
    : '';

  const days = data.daily
    .map((day, i) => {
      const d = describeCode(day.code);
      const name = i === 0 ? '今日' : day.weekday;
      return `<li class="${i === 0 ? 'weather-day is-today' : 'weather-day'}">
        <span class="weather-day__name">${name}</span>
        <span class="weather-day__icon">${d.icon}</span>
        <span class="weather-day__temp"><b>${day.tmax}°</b> / ${day.tmin}°</span>
        <span class="weather-day__rain">${day.precipProb}%</span>
      </li>`;
    })
    .join('');

  const updated = new Date(data.fetchedAt).toLocaleString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const uvText = cur.uvIndex > 0 ? `<div><dt>紫外線</dt><dd>${cur.uvIndex}</dd></div>` : '';

  return `
    ${risksHTML}
    <div class="weather-now">
      <div class="weather-now__main">
        <span class="weather-now__icon">${now.icon}</span>
        <span class="weather-now__temp">${cur.temp}<span class="weather-now__unit">℃</span></span>
        <span class="weather-now__label">${now.label}</span>
      </div>
      <dl class="weather-now__stats">
        <div><dt>体感</dt><dd>${cur.apparent}℃</dd></div>
        <div><dt>湿度</dt><dd>${cur.humidity}%</dd></div>
        <div><dt>風速</dt><dd>${cur.wind}m/s</dd></div>
        <div><dt>降水確率</dt><dd>${cur.precipProb}%</dd></div>
        ${uvText}
      </dl>
    </div>
    <ul class="weather-days">${days}</ul>
    ${adviceHTML}
    <p class="weather-meta">参照時刻 ${updated}</p>
  `;
}

// クライアント側でタブの切り替えを有効にする（初期状態はすべて表示＝JSなしでも閲覧可能）
export function wireWeatherTabs(root: HTMLElement): void {
  root.classList.add('has-tabs');
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('.weather-tab'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('.weather-panel'));
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const key = tab.dataset.key;
      tabs.forEach((t) => t.classList.toggle('is-active', t === tab));
      panels.forEach((p) => p.classList.toggle('is-active', p.dataset.key === key));
    });
  });
}
