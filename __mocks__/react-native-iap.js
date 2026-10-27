module.exports = {
    initConnection: jest.fn(() => Promise.resolve(true)),
    endConnection: jest.fn(() => Promise.resolve()),
    fetchProducts: jest.fn(() => Promise.resolve([])),
    requestPurchase: jest.fn(() => Promise.resolve({})),
    purchaseUpdatedListener: jest.fn(() => ({ remove: jest.fn() })),
    purchaseErrorListener: jest.fn(() => ({ remove: jest.fn() })),
};
