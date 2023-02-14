/**
 * 
 * @param {string} url 
 * @param {'GET' | 'POST' | 'PUT' | 'DELETE'} method 
 * @param {'json' | 'text'} type
 * @param {{}} headerList 
 * @param {{}} payload 
 * @returns {{StatusCode: string, StatusMessage: string, ExceptionInfo: string, Data: Array<{}> | {}}}
 */
const CLS_MakeRequest = async (url, method, type, headerList = {}, payload = {}) => {
    const token = sessionStorage.getItem(cls_authTokenKey);
    if (token) {
        headerList["Authorization"] = `Bearer ${token}`;
    }
    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                let jwtToken = xhr.getResponseHeader("Authorization");
                if(jwtToken) {
                    sessionStorage.setItem(cls_authTokenKey, jwtToken.replace("Bearer ", ""));
                }
                resolve(type == 'json' ? JSON.parse(xhr.response) : xhr.response);
            }
            else if (xhr.status == 401) {
                sessionStorage.removeItem(cls_authTokenKey);
                reject({
                    StatusCode: "UNAUTHORIZED",
                    StatusMessage: "We received a 401 response. Please reauthenticate.",
                    ExceptionInfo: `${xhr.status}::${xhr.statusText}`
                });
            }
            else {
                reject({
                    StatusCode: "SERVER_ERROR",
                    StatusMessage: "We received an unexpected error from the server. Please try again.",
                    ExceptionInfo: `${xhr.status}::${xhr.statusText}`
                });
            }
        };
        xhr.onerror = function () {
            reject({
                StatusCode: "SERVER_ERROR",
                StatusMessage: "We received an unexpected error from the server. Please try again.",
                ExceptionInfo: `${xhr.status}::${xhr.statusText}`
            });
        };
        if (headerList) {
            Object.keys(headerList).forEach((key) => {
                xhr.setRequestHeader(key, headerList[key]);
            });
        }
        if (payload && typeof payload === 'object' && type == 'json') {
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.send(JSON.stringify(payload));
        }
        else {
            xhr.withCredentials = true;
            xhr.send(payload);
        }
    });
};
              
let request = {
    orderId: {orderId},
    orderGrandTotal: {orderGrandTotal},
    orderGrandTotalCents: {orderGrandTotalCents},
    customerEmailAddress: {customerEmailAddress}
}
let response = await CLS_MakeRequest("https://api.coldlabs.co/api/user/test-order-submit", "POST", "json", {}, );
console.log("Response: ", response);