import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMeQuery } from './get-me.query';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.entity';

@QueryHandler(GetMeQuery)
export class GetMeHandler implements IQueryHandler<GetMeQuery, Omit<User, 'password'>> {
    constructor(private readonly userRepo: UserRepository) {}

    async execute(query: GetMeQuery): Promise<Omit<User, 'password'>> {
        const user = await this.userRepo.getByIdOrFail(query.id);
        const { password, ...result } = user;
        return result;
    }
}
