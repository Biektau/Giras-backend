import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ValidateTokenQuery } from './validate-token.query';
import { TokenService } from '../services/token.service';
import { UserRole } from '../user-role.enum';

@QueryHandler(ValidateTokenQuery)
export class ValidateTokenHandler implements IQueryHandler<ValidateTokenQuery, { id: string; role: UserRole }> {
    constructor(private readonly tokenService: TokenService) {}

    execute(query: ValidateTokenQuery): Promise<{ id: string; role: UserRole }> {
        return Promise.resolve(this.tokenService.verifyAccess(query.accessToken));
    }
}
