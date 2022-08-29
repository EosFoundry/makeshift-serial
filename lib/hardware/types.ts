
export type InputRegistry = {
    buttons: Button[];
    dials: Dial[];
}

export type Button = {
    id: string;
    rising: Function;
    held: Function;
    falling: Function;
}

export type Dial = {
    id: string;
    left: Function;
    right: Function;
}

export type Sensor = {

}