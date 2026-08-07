export class User{
    constructor(public fullName: string ,
         public email: string ,
         public phoneNumber: string,
         private password: string,
         private role: string){}
}

