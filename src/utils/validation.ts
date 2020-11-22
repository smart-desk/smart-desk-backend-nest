import { ValidationError } from 'class-validator';

export function getMessageFromValidationErrors(errs: ValidationError[]): string[] {
    let messages = [];
    for (const err of errs) {
        if (err.children && err.children.length) {
            messages = [...messages, ...getMessageFromValidationErrors(err.children)];
        } else {
            messages = [...messages, ...Object.values(err.constraints)];
        }
    }
    return messages;
}
