import { SerialPort } from 'serialport';
import { Msg } from '../utils';
const msg = Msg('Serial');
export async function getPort() {
    try {
        const portList = await SerialPort.list();
        let makeShiftPortInfo = portList.filter((portInfo) => {
            return (portInfo.vendorId === '16c0'
                && portInfo.productId === '0483');
        });
        const makeShiftPort = new SerialPort({
            path: makeShiftPortInfo[0].path,
            baudRate: 42069
        });
        console.dir(makeShiftPortInfo);
        return makeShiftPort;
    }
    catch (e) {
        msg(e);
    }
}
