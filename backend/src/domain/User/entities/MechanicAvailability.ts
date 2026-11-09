export class MechanicAvailability {
    constructor(
        public mechanicId: string,
        public isAvailable: boolean,
        public latitude: number,
        public longitude: number,
        public id?: string,
        public updatedAt?: Date
    ) {}
}

