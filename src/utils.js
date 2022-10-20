export const strfy = (o) => JSON.stringify(o, null, 2);
export const Msg = (n) => {
  const name = n;
  return (loggable) => {
    process.stdout.write(`${name} ==> `);
    if (typeof loggable !== 'string') {
      console.dir(loggable);
    } else {
      console.log(loggable);
    }
  }
};
