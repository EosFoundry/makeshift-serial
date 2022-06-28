export function sendMessage(p, l, d) {
    const m = {
        label: l,
        data: d
    };
    p.send(m);
}
