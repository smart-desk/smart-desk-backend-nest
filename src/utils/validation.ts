import { ValidationError, registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

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

/**
 * Verifies that provided url is Image url
 * @example
 * ```
 *  @IsImageUrl()
 *  value: string;
 * ```
 */
export function IsImageUrl(validationOptions?: ValidationOptions) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'IsImageUrl',
            target: object.constructor,
            propertyName: propertyName,
            constraints: ['value'],
            options: {
                message: 'value must be url to image',
                ...validationOptions,
            },
            validator: {
                validate(value: any) {
                    return typeof value === 'string' && value.match(/\.(jpeg|jpg|gif|png)$/) != null;
                },
            },
        });
    };
}
