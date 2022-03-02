export const strfy = (o) => JSON.stringify(o, null, 2); 
export const Msg = (n) => { return (s) => console.log(`${n} ==> ${s}`) };