// Web mock for purchases
// This allows the app to run in the browser without crashing due to native module missing

export const initPurchases = async () => {
    console.log('Purchases: Web mock initialized');
};

export const getOfferings = async (): Promise<any> => {
    console.log('Purchases: getOfferings called (web mock)');
    return null;
};

export const purchasePackage = async (pack: any) => {
    console.log('Purchases: purchasePackage called (web mock)', pack);
    return null;
};

export const getCustomerInfo = async () => {
    console.log('Purchases: getCustomerInfo called (web mock)');
    return null;
};

export const restorePurchases = async () => {
    console.log('Purchases: restorePurchases called (web mock)');
    return null;
};
