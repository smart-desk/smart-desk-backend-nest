import { ValidationError } from 'class-validator';

export function getMessageFromValidationErrors(errs: ValidationError[]): string[] {
    return errs.reduce((acc, err) => acc.concat(Object.values(err.constraints)), [] as string[]);
}
