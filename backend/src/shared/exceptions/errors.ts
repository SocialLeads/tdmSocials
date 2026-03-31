export class EntityNotFoundError extends Error {
    constructor(entityName: string, entityId: string) {
        super(`${entityName} with ID '${entityId}' not found`);
        this.name = `${entityName}NotFoundError`;
    }
}

export class AuthenticationError extends Error {
    constructor() {
        super('Invalid username or password');
        this.name = 'AuthenticationError';
    }
}

export class TokenInvalidExpiredError extends Error {
    constructor() {
        super('The token provided is expired or invalid');
        this.name = 'TokenInvalidExpired';
    }
}

export class DatabaseOperationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DatabaseOperationError';
    }
}
