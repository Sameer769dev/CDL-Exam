module.exports = {
    NitroModules: {
        getHybridObject: jest.fn(),
        registerHybridObject: jest.fn(),
        hasHybridObject: jest.fn(() => false),
    },
};
