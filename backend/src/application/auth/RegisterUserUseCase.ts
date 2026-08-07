import {IUserRepository} from '../../domain/User/repositories/IUserRepository.js';
import {IPasswordHasher} from '../contracts/IPasswordHasher.js'
export class RegisterUserUseCase {
    constructor(private userRepository: IUserRepository,
        private passwordHasher: IPasswordHasher
    ){

    }
}
