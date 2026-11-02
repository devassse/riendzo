/**
 * Minimal QR Code generator (byte mode, error correction M, versions 1-10,
 * ≈ 213 bytes max). No dependencies. Returns the module matrix or an SVG.
 */
type Grid = boolean[][];

const ECC_PER_BLOCK = [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26];
const NUM_BLOCKS = [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5];

const rawModules = (v: number) => {
    let r = (16 * v + 128) * v + 64;
    if (v >= 2) {
        const n = Math.floor(v / 7) + 2;
        r -= (25 * n - 10) * n - 55;
        if (v >= 7) r -= 36;
    }
    return r;
};
const dataCodewords = (v: number) => Math.floor(rawModules(v) / 8) - ECC_PER_BLOCK[v] * NUM_BLOCKS[v];

/* Reed-Solomon over GF(256), polynomial 0x11D */
const mul = (x: number, y: number) => {
    let z = 0;
    for (let i = 7; i >= 0; i--) {
        z = (z << 1) ^ ((z >>> 7) * 0x11d);
        z ^= ((y >>> i) & 1) * x;
    }
    return z;
};
const generator = (deg: number) => {
    const r = new Array<number>(deg).fill(0);
    r[deg - 1] = 1;
    let root = 1;
    for (let i = 0; i < deg; i++) {
        for (let j = 0; j < deg; j++) {
            r[j] = mul(r[j], root);
            if (j + 1 < deg) r[j] ^= r[j + 1];
        }
        root = mul(root, 0x02);
    }
    return r;
};
const remainder = (data: number[], gen: number[]) => {
    const r = new Array<number>(gen.length).fill(0);
    for (const b of data) {
        const f = b ^ (r.shift() as number);
        r.push(0);
        gen.forEach((c, i) => (r[i] ^= mul(c, f)));
    }
    return r;
};

const bit = (x: number, i: number) => ((x >>> i) & 1) !== 0;

export function qrMatrix(text: string): Grid {
    const bytes = Array.from(new TextEncoder().encode(text));

    let version = 1;
    for (; version <= 10; version++) {
        const cc = version < 10 ? 8 : 16;
        if (4 + cc + bytes.length * 8 <= dataCodewords(version) * 8) break;
    }
    if (version > 10) throw new Error("Texto demasiado longo para o QR Code");

    // 1. Data bits
    const bits: number[] = [];
    const put = (val: number, len: number) => {
        for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
    };
    put(0b0100, 4);
    put(bytes.length, version < 10 ? 8 : 16);
    bytes.forEach((b) => put(b, 8));
    const cap = dataCodewords(version) * 8;
    put(0, Math.min(4, cap - bits.length));
    while (bits.length % 8) bits.push(0);
    for (let pad = 0xec; bits.length < cap; pad ^= 0xec ^ 0x11) put(pad, 8);
    const data: number[] = [];
    for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(""), 2));

    // 2. Blocks + error correction, interleaved
    const nb = NUM_BLOCKS[version], eccLen = ECC_PER_BLOCK[version];
    const raw = Math.floor(rawModules(version) / 8);
    const shortLen = Math.floor(raw / nb);
    const numShort = nb - (raw % nb);
    const gen = generator(eccLen);
    const blocks: number[][] = [];
    for (let i = 0, k = 0; i < nb; i++) {
        const len = shortLen - eccLen + (i < numShort ? 0 : 1);
        const d = data.slice(k, k + len);
        k += len;
        blocks.push([...d, ...(i < numShort ? [0] : []), ...remainder(d, gen)]);
    }
    const final: number[] = [];
    for (let i = 0; i < blocks[0].length; i++) {
        blocks.forEach((b, j) => {
            if (i !== shortLen - eccLen || j >= numShort) final.push(b[i]);
        });
    }

    // 3. Function patterns
    const size = version * 4 + 17;
    const mod: Grid = Array.from({ length: size }, () => new Array(size).fill(false));
    const fn: Grid = Array.from({ length: size }, () => new Array(size).fill(false));
    const setFn = (x: number, y: number, dark: boolean) => {
        mod[y][x] = dark;
        fn[y][x] = true;
    };

    for (let i = 0; i < size; i++) {
        setFn(6, i, i % 2 === 0);
        setFn(i, 6, i % 2 === 0);
    }
    const finder = (cx: number, cy: number) => {
        for (let dy = -4; dy <= 4; dy++)
            for (let dx = -4; dx <= 4; dx++) {
                const x = cx + dx, y = cy + dy, d = Math.max(Math.abs(dx), Math.abs(dy));
                if (x >= 0 && x < size && y >= 0 && y < size) setFn(x, y, d !== 2 && d !== 4);
            }
    };
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);

    const n = version === 1 ? 0 : Math.floor(version / 7) + 2;
    const step = version === 1 ? 0 : Math.ceil((version * 4 + 4) / (n * 2 - 2)) * 2;
    const pos = version === 1 ? [] : [6];
    for (let p = size - 7; pos.length < n; p -= step) pos.splice(1, 0, p);
    pos.forEach((cy, i) =>
        pos.forEach((cx, j) => {
            if ((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)) return;
            for (let dy = -2; dy <= 2; dy++)
                for (let dx = -2; dx <= 2; dx++) setFn(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        })
    );

    const formatBits = (mask: number) => {
        const d = (0 << 3) | mask; // ECC level M = 00
        let rem = d;
        for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
        const bits = ((d << 10) | rem) ^ 0x5412;
        for (let i = 0; i <= 5; i++) setFn(8, i, bit(bits, i));
        setFn(8, 7, bit(bits, 6)); setFn(8, 8, bit(bits, 7)); setFn(7, 8, bit(bits, 8));
        for (let i = 9; i < 15; i++) setFn(14 - i, 8, bit(bits, i));
        for (let i = 0; i < 8; i++) setFn(size - 1 - i, 8, bit(bits, i));
        for (let i = 8; i < 15; i++) setFn(8, size - 15 + i, bit(bits, i));
        setFn(8, size - 8, true);
    };
    formatBits(0);
    if (version >= 7) {
        let rem = version;
        for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
        const bits = (version << 12) | rem;
        for (let i = 0; i < 18; i++) {
            const b = bit(bits, i), a = size - 11 + (i % 3), c = Math.floor(i / 3);
            setFn(a, c, b);
            setFn(c, a, b);
        }
    }

    // 4. Place data (zig-zag)
    let k = 0;
    for (let right = size - 1; right >= 1; right -= 2) {
        if (right === 6) right = 5;
        for (let vert = 0; vert < size; vert++)
            for (let j = 0; j < 2; j++) {
                const x = right - j;
                const y = ((right + 1) & 2) === 0 ? size - 1 - vert : vert;
                if (!fn[y][x] && k < final.length * 8) {
                    mod[y][x] = bit(final[k >>> 3], 7 - (k & 7));
                    k++;
                }
            }
    }

    // 5. Best mask
    const MASKS: ((x: number, y: number) => boolean)[] = [
        (x, y) => (x + y) % 2 === 0, (_x, y) => y % 2 === 0, (x) => x % 3 === 0, (x, y) => (x + y) % 3 === 0,
        (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
        (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0, (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
    ];
    const apply = (mask: number) => {
        for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!fn[y][x] && MASKS[mask](x, y)) mod[y][x] = !mod[y][x];
    };
    const penalty = () => {
        let p = 0, dark = 0;
        const line = (get: (i: number) => boolean) => {
            let run = 1;
            for (let i = 1; i < size; i++) {
                if (get(i) === get(i - 1)) run++;
                else { if (run >= 5) p += 3 + (run - 5); run = 1; }
            }
            if (run >= 5) p += 3 + (run - 5);
            const s = Array.from({ length: size }, (_, i) => (get(i) ? "1" : "0")).join("");
            for (const re of [/10111010000/g, /00001011101/g]) {
                let m;
                while ((m = re.exec(s))) { p += 40; re.lastIndex = m.index + 1; }
            }
        };
        for (let y = 0; y < size; y++) line((i) => mod[y][i]);
        for (let x = 0; x < size; x++) line((i) => mod[i][x]);
        for (let y = 0; y < size - 1; y++)
            for (let x = 0; x < size - 1; x++) {
                const c = mod[y][x];
                if (c === mod[y][x + 1] && c === mod[y + 1][x] && c === mod[y + 1][x + 1]) p += 3;
            }
        mod.forEach((r) => r.forEach((c) => c && dark++));
        const total = size * size;
        p += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10;
        return p;
    };
    let best = 0, bestScore = Infinity;
    for (let m = 0; m < 8; m++) {
        apply(m);
        formatBits(m);
        const sc = penalty();
        if (sc < bestScore) { bestScore = sc; best = m; }
        apply(m); // undo
    }
    apply(best);
    formatBits(best);
    return mod;
}

/** Square SVG with a quiet zone of 4 modules. */
export function qrSvg(text: string, opts: { dark?: string; light?: string; margin?: number } = {}) {
    const { dark = "#000000", light = "#ffffff", margin = 4 } = opts;
    const m = qrMatrix(text);
    const size = m.length + margin * 2;
    let d = "";
    m.forEach((row, y) => {
        let x = 0;
        while (x < row.length) {
            if (!row[x]) { x++; continue; }
            let w = 1;
            while (x + w < row.length && row[x + w]) w++;
            d += `M${x + margin} ${y + margin}h${w}v1h-${w}z`;
            x += w;
        }
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="${light}"/><path d="${d}" fill="${dark}"/></svg>`;
}
