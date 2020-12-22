import fn = jest.fn;

export const AcGuardMock = {
    canActivate: fn().mockReturnValue(true),
};
