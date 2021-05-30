import fn = jest.fn;

export const MailServiceMock = {
    sendMessageToUser: fn().mockReturnValue(undefined),
};
