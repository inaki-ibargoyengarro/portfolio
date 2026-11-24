/* =====================================================================
   GHOSTING DETECTOR™ · Etiquetas, clasificación y estadística
   Compartido por el cuestionario, los resultados y el panel admin.
   ===================================================================== */
(function () {
  const LABELS = {
    level: { baja: 'Incomodidad baja', media: 'Incomodidad media', alta: 'Incomodidad alta' },
    levelShort: { baja: 'Baja', media: 'Media', alta: 'Alta' },
    levelRange: { baja: '4–7 pts', media: '8–14 pts', alta: '15–20 pts' },
    y: { explicita: 'Ruptura explícita', ghosting: 'Ghosting', otra: 'Otra situación' },
    z: { digital: 'Solo digital', citas_1_5: '1 a 5 citas', citas_mas_5: 'Más de 5 citas' },
    age: { '18_24': '18 a 24', '25_29': '25 a 29', '30_35': '30 a 35', menor_18: 'Menos de 18', mayor_35: 'Más de 35' },
    reason: { edad: 'Edad fuera de rango', residencia: 'No reside en centro urbano', uso_apps: 'No usa redes ni apps de citas', sin_finalizacion: 'No finalizó un vínculo en 12 meses' }
  };
  const LEVELS = ['baja', 'media', 'alta'];
  const DEPTHS = ['digital', 'citas_1_5', 'citas_mas_5'];
  const STRATS = ['explicita', 'ghosting'];

  function classify(total) {
    if (total == null || isNaN(total)) return null;
    if (total <= 7) return 'baja';
    if (total <= 14) return 'media';
    return 'alta';
  }

  /* --- Función gamma incompleta regularizada (Numerical Recipes) --- */
  function gammaln(x) {
    const c = [76.18009172947146, -86.50532032941677, 24.01409824083091,
      -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    let y = x, tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;
    for (let j = 0; j < 6; j++) ser += c[j] / ++y;
    return -tmp + Math.log(2.5066282746310005 * ser / x);
  }
  function gammaP(a, x) { // P(a,x)
    if (x <= 0) return 0;
    if (x < a + 1) {
      let ap = a, sum = 1 / a, del = sum;
      for (let n = 0; n < 500; n++) { ap++; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-14) break; }
      return sum * Math.exp(-x + a * Math.log(x) - gammaln(a));
    }
    // fracción continua para Q y luego P = 1 - Q
    let b = x + 1 - a, c = 1 / 1e-300, d = 1 / b, h = d;
    for (let i = 1; i < 500; i++) {
      const an = -i * (i - a); b += 2;
      d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300;
      c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300;
      d = 1 / d; const del = d * c; h *= del;
      if (Math.abs(del - 1) < 1e-14) break;
    }
    return 1 - Math.exp(-x + a * Math.log(x) - gammaln(a)) * h;
  }
  /** p-valor de cola superior de una chi-cuadrado */
  function chiSquarePValue(chi2, df) {
    if (!(df > 0) || !(chi2 >= 0)) return NaN;
    return Math.max(0, Math.min(1, 1 - gammaP(df / 2, chi2 / 2)));
  }

  /**
   * Contraste chi-cuadrado de independencia sobre una tabla r×c de frecuencias.
   * Quita filas y columnas cuyo total es 0 (no aportan grados de libertad).
   */
  function chiSquareTest(table) {
    const rowsIdx = table.map((r, i) => i).filter(i => table[i].reduce((a, b) => a + b, 0) > 0);
    const nCols = table[0] ? table[0].length : 0;
    const colsIdx = [];
    for (let j = 0; j < nCols; j++) if (table.reduce((a, r) => a + r[j], 0) > 0) colsIdx.push(j);
    const obs = rowsIdx.map(i => colsIdx.map(j => table[i][j]));
    const R = obs.length, C = colsIdx.length;
    const N = obs.reduce((a, r) => a + r.reduce((x, y) => x + y, 0), 0);
    const out = { N, rowsUsed: rowsIdx, colsUsed: colsIdx, valid: false, reasons: [] };
    if (R < 2 || C < 2) { out.reasons.push('La tabla necesita al menos 2 filas y 2 columnas con datos.'); return out; }
    const rowT = obs.map(r => r.reduce((a, b) => a + b, 0));
    const colT = colsIdx.map((_, j) => obs.reduce((a, r) => a + r[j], 0));
    const expected = obs.map((r, i) => r.map((_, j) => rowT[i] * colT[j] / N));
    let chi2 = 0;
    obs.forEach((r, i) => r.forEach((o, j) => { const e = expected[i][j]; chi2 += (o - e) * (o - e) / e; }));
    const df = (R - 1) * (C - 1);
    const cells = R * C;
    const below5 = expected.flat().filter(e => e < 5).length;
    const below1 = expected.flat().filter(e => e < 1).length;
    out.chi2 = chi2; out.df = df; out.p = chiSquarePValue(chi2, df);
    out.expected = expected; out.observed = obs; out.rowTotals = rowT; out.colTotals = colT;
    out.cramerV = Math.sqrt(chi2 / (N * Math.min(R - 1, C - 1)));
    out.minExpected = Math.min.apply(null, expected.flat());
    out.pctExpectedBelow5 = below5 / cells * 100;
    // Supuestos de Cochran: ninguna frecuencia esperada < 1 y no más del 20% < 5
    out.assumptionsOk = below1 === 0 && below5 / cells <= 0.2;
    if (below1 > 0) out.reasons.push('Hay frecuencias esperadas menores a 1.');
    if (below5 / cells > 0.2) out.reasons.push('Más del 20% de las celdas tiene frecuencia esperada menor a 5 (' + below5 + ' de ' + cells + ').');
    out.valid = true;
    return out;
  }

  function pct(n, d, digits) {
    if (!d) return '–';
    return (n / d * 100).toFixed(digits == null ? 1 : digits).replace('.', ',') + '%';
  }
  function num(x, digits) { return x.toFixed(digits).replace('.', ','); }
  function formatP(p) {
    if (isNaN(p)) return '–';
    if (p < 0.001) return '< 0,001';
    return p.toFixed(3).replace('.', ',');
  }

  window.GD_STATS = { LABELS, LEVELS, DEPTHS, STRATS, classify, chiSquareTest, chiSquarePValue, pct, num, formatP };
})();
