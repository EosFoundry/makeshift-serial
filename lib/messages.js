export function sendMessage(p, l, d) {
    var m = {
        label: l,
        data: d
    };
    p.send(m);
}
