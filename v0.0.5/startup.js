const cls_authTokenKey = "cls_authToken";
const cls_editorConfigKey = "cls_editorConfig";
const cls_tokenInfoKey = "cls_tokenInfoKey";
const cls_apiUrl = "https://api.coldlabs.co";

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

/**
 * <script id='cls_startup' data-user-token=''  data-website-token='' src='https://localhost:55010/static-files/startup.js' ></script>
 */
const CLS_Startup = async () => {
    /**
     * @type {HTMLScriptElement}
     */
    const cls_startup = document.getElementById('cls_startup');
    if (cls_startup) {
        const userToken = cls_startup.dataset.userToken;
        const websiteToken = cls_startup.dataset.websiteToken;
        const response = await CLS_MakeRequest(`${cls_apiUrl}/api/config/authenticate-user?userToken=${userToken}&websiteToken=${websiteToken}`, 'GET', 'json', {});
        if (response.StatusCode == "SUCCESS") {
            localStorage.setItem("cls_CurrentSavedItems", JSON.stringify(response.Data.ElementAdjustmentList));
            localStorage.setItem(cls_editorConfigKey, JSON.stringify(response.Data.EditorConfig));
            sessionStorage.setItem(cls_authTokenKey, response.Data.BearerToken);
            sessionStorage.setItem(cls_tokenInfoKey, JSON.stringify({ UserToken: userToken, WebsiteToken: websiteToken }));
            console.log("SUCCESS RESPONSE: ", response);
            CLS_AddMainScript();
        }
        else {
            console.log("ERROR RESPONSE: ", response);
        }
    }
}

/**
 * 
 * @param {string} userToken 
 * @param {string} websiteToken 
 */
const CLS_AddMainScript = async () => {
    const response = await CLS_MakeRequest(`${cls_apiUrl}/static-files/main.js`, 'GET', 'text');
    const scriptElement = document.createElement('script');
    scriptElement.setAttribute('cls-main-script', 'true');
    scriptElement.innerHTML = response;
    document.body.appendChild(scriptElement);
}

CLS_Startup()
