export enum SortingType {
    ASC = 'ASC',
    DESC = 'DESC',
}

export class Sorting {
    [key: string]: SortingType;
}
