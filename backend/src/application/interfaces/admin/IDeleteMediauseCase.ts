export interface IDeleteMediaUseCase {
    execute(id: string): Promise<void>;
}