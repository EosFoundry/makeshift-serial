export type Message = {
    label: string;
    data: any;
}

export function sendMessage(p:any, l: string, d? : any) {
    const m:Message = {
        label:l,
        data: d
    };
    p.send(m);
}
