const cls_authTokenKey = "cls_authToken";
const cls_editorConfigKey = "cls_editorConfig";
const cls_tokenInfoKey = "cls_tokenInfoKey";
const cls_apiUrl = "https://localhost:55010"

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
    let token = sessionStorage.getItem(cls_authTokenKey);
    if(token) {
        headerList["Authorization"] = `Bearer ${token}`;
    }
    let response = await fetch(url, {
        method: method,
        mode: 'cors',
        credentials: 'include',
        headers: headerList,
        body: method == 'GET' ? null : JSON.stringify(payload)
    });
    if(response.status == 200) {
        let jwtToken = response.headers.get("Authorization");
        if(jwtToken) {
            sessionStorage.setItem(cls_authTokenKey, jwtToken.replace("Bearer ", ""));
        }
        if(type == 'json') {
            return await response.json();
        }
        else {
            return await response.text();
        }
    }
    else if (response.status == 401) {
        sessionStorage.removeItem(cls_authTokenKey);
        return {
            StatusCode: "UNAUTHORIZED",
            StatusMessage: "We received a 401 response. Please reauthenticate."
        }
    }
    else {
        return {
            StatusCode: "SERVER_ERROR",
            StatusMessage: "We received an unexpected error from the server. Please try again.",
            ExceptionInfo: JSON.stringify(response)
        }
    }
};

/**
 * <script id='cls_startup' data-user-token=''  data-website-token='' src='https://localhost:55010/static-files/startup.js' ></script>
 */
const CLS_Startup = async () => {
    let cls_startup = document.getElementById('cls_startup');
    if(cls_startup) {
        let userToken = cls_startup.dataset.userToken;
        let websiteToken = cls_startup.dataset.websiteToken;
        let response = await CLS_MakeRequest(`${cls_apiUrl}/api/config/authenticate-user?userToken=${userToken}&websiteToken=${websiteToken}`, 'GET', 'json', {});
        if(response.StatusCode == "SUCCESS") {
            localStorage.setItem("cls_CurrentSavedItems", JSON.stringify(response.Data.ElementAdjustmentList));
            localStorage.setItem(cls_editorConfigKey, JSON.stringify(response.Data.EditorConfig));
            sessionStorage.setItem(cls_authTokenKey, response.Data.BearerToken);
            sessionStorage.setItem(cls_tokenInfoKey, JSON.stringify({UserToken: userToken, WebsiteToken: websiteToken}));
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
    let response = await CLS_MakeRequest(`${cls_apiUrl}/static-files/main.js`, 'GET', 'text');
    let scriptElement = document.createElement('script');
    scriptElement.innerHTML = response
    document.body.appendChild(scriptElement);
}

CLS_Startup()
