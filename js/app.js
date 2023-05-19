var ApplicationManager = function(msgexception) {
    var LoginWindow = null
    registerForEvents()
    function setLoginWindow() {
        $('#login').css("display", "block")
        var objectEl = document.getElementById('login');
        if (objectEl.contentWindow != null) {
            LoginWindow = objectEl.contentWindow;
        }
    }
    function testAndReturn(argument, delimeter) {
         if (typeof(argument) === 'undefined') {
             return ""
         } else {
             return delimeter + argument
         }
    }
    function getParameters() {
         return testAndReturn(window.location.href.split("?")[1], "?")
     }
     function getHashCode() {
         return testAndReturn(window.location.href.split("?")[0].split("#")[1], "#")
     }
     function getServer() {
         return testAndReturn(window.location.href.split("?")[0].split("#")[0], "")
     }
     function getSearchStr() {
         const params = getParameters()
         if (params.length > 0) {
            return params
         } else {
            return "?name=value"
         }
    }
     function getServerURL() {
        return getServer() + getHashCode()
     }
     function getQueryValue(name) {
        try {
            const searchstr = window.location.href.split("?")[1]
            const searchParams = new URLSearchParams(searchstr);
            const value = searchParams.get(name)
            console.log("getQueryValue(); name=[" + name + "] value=[" + value + "] search=[" + searchstr + "]")
                if (value != null) {
                    $("#" + name).val(value)
                }
                return value
        } catch (e) {
            console.log(e.toString())
        }
        return null
    }
      function setCookie(message) {
          var token = JSON.parse(message).token
          console.log("set token=[" + token + "]")
          if (typeof(token) === "undefined") {
            token = ""
          } else
          if (token.length > 0)
          try {
            const formData = new URLSearchParams(getSearchStr())
            const oldtoken = formData.get('neotoken')
            if (token === "expired") {
                token = ""
            }
            if (oldtoken != token) {
                $.cookie('neotoken', token, { expires: 365 })
                console.log("Cookie set: [" + document.cookie + "] token=[" + token + "]")
                formData.delete('neotoken')
                formData.set('neotoken', token)
                const newhref = getServer() + getHashCode() + "?" + formData.toString()
                //alert("$$$$$$$$ New href = [" + newhref + "]")
                //window.location.href = newhref;
            }
          } catch (e) {
            console.log("$$$$$$$$ No New href = [" + e.toString() + "]")
          }
          return token
      }
    function testCookie(callback) {
       console.log("testCookie()")
       function parseCookie() {
         const cookies = document.cookie.split(';');
         const cookieMap = new Map();
         for (const cookie of cookies) {
           const [name, value] = cookie.split('=').map(str => str.trim());
           cookieMap.set(name, value);
         }
         return cookieMap;
       }
       try {
           const cookieMap = parseCookie();
           const neotoken = cookieMap.get('neotoken')
           console.log("cookie token=[" + neotoken + "]")
           function testNeotokenCookie() {
             if (typeof(neotoken) === 'undefined') {
                return false
             } else
             if (neotoken.length > 0) {
                return true
             } else {
                return false
             }
           }
           if (testNeotokenCookie()) {
              $("#neotoken").val(neotoken)
              return callback(neotoken)
           } else {
              const token = getQueryValue('neotoken')
              if (token == null) {
                return callback(null)
              } else
              if (token.length > 0) {
                messageobj = {
                 token: token,
                 renew: "true"
                }
                message = JSON.stringify(messageobj)
                console.log("message=[" + message + "]")
                setCookie(message)
                return callback(token, true)
             } else {
                return callback(null)
             }
          }
       } catch (e) {
         console.log(e.toString())
         return callback(null)
       }
       const savedtoken = $("#neotoken").val()
       console.log("saved token=[" + savedtoken + "]")
       return callback(savedtoken)
    }
    function getNeoToken (token, renewflag) {
       try {
           if (token.length <= 0) {
                return ""
           }
       } catch (e) {
            return ""
       }
       function getRenewFlag () {
            if (typeof(renewflag) === "undefined") {
                return ""
            } else
            if (renewflag) {
                return "&renewflag=true"
            } else {
                return ""
            }
       }
       console.log("token=[" + token + "] renew=[" + renewflag + "]")
       return "&neotoken=" + token + getRenewFlag()
    }

    function registerForEvents() {
        // Add an event listener for the message event
        window.addEventListener("message", receiveMessage, false);
        console.log("Adding event listener")
        window.addEventListener('popstate', function(event) {
          location.reload();
        });
        setLoginWindow()
    }
    function receiveMessage(event) {
      // Check if the message is coming from the expected origin
       console.log("origin=[" + JSON.stringify(event) + "]")
       if (event.isTrusted === true) {
          // Process the message data
          var message = event.data;
          console.log("Received messagex: [" + message + "]");
          function getJSONMsg() {
            try{
                return JSON.parse(message)
            } catch (e) {
            }
            return {}
          }
          try {
            const jsonmsg = getJSONMsg()
            console.log("returned json object.")
            if (typeof(jsonmsg.operation) === "undefined") {
                if (typeof(jsonmsg.token) === "undefined") {
                    console.log("Operation undefined;")
                    msgexception(event)
                } else
                if (setCookie(JSON.stringify(jsonmsg)).length > 0) {
                    console.log("HHHHHAS a cookie")
                } else
                if (jsonmsg.login == true) {
                    console.log("HHHHHAS NO cookie")
                    msgexception(event, true)
                } else {
                    console.log("no login required.")
                }
            } else
            if (jsonmsg.operation === 'seturistate') {
                function sethref () {
                    const formData = new URLSearchParams(jsonmsg.newhref.substring(1))
                    formData.delete('neotoken')
                    const newhref = getServer() + getHashCode() + "?" + formData.toString()
                    console.log(newhref)
                    return newhref
                }
                window.location.href = sethref()
              const state = { user: 12 };
              const title = 'My new page';
                //history.pushState(state, title, window.location.href)
                console.log("New href = [" + jsonmsg.newhref + "]")
            } else
            if (jsonmsg.operation === 'showappointmentrequest') {
                console.log("appointment request")
                console.log("Request object", JSON.stringify($('#login').children()))
                setLoginWindow()
                var message = {
                  operation: 'showsection',
                  sectionname: 'Request',
                  datetime: jsonmsg.datetime,
                  message: jsonmsg
                }
                LoginWindow.postMessage(JSON.stringify(message), "*");
                $('#login').css("display", "block")
            } else
            if (jsonmsg.operation === 'closesidebar') {
                toggleSidebar(false)
            } else {
                console.log("Operation unknown; [" + jsonmsg.operation + "]")
                msgexception(event)
            }
          } catch (e) {
            console.log(e.toString())
            msgexception(event)
         }
       }
    }

    return {
        verify: function (initialize, complete) {
            testCookie((token, renewflag)=> {
                   const thishref = initialize()
                   const newquery = thishref + getHashCode() + getSearchStr() +
                   "&serverurl=" + getServerURL() + getNeoToken(token, renewflag)
                   console.log("$$$ verify query=[" + newquery + "]")
                   console.log("thishref=[" + thishref + "]")
                   console.log("hashcode=[" + getHashCode() + "]")
                   console.log("searchstr=[" + getSearchStr() + "]")
                   complete(newquery)
            })
        },
        getargs: function (initialize, complete) {
            //registerForEvents()
            testCookie((token)=> {
                   const thishref = initialize()
                   const newquery = thishref + getHashCode() + getSearchStr() + getNeoToken(token)
                   console.log("$$$ getargs query=[" + newquery + "]")
                   complete(newquery)
            })
        },
        testCookie: function (callback) {
            testCookie(callback)
        },
        getHashValue: function () {
            return testAndReturn(window.location.href.split("?")[0].split("#")[1], "#")
        },
        getQueryValue: function (name) {
            return getQueryValue(name)
        }
    }
}
function removeLeadingChar(string, char) {
    if (string.startsWith(char)) {
        return string.substring(1);
    } else {
        return string;
    }
}
function testCookie(callback) {
    ApplicationManager(() => {}).testCookie(callback)
}
function getHashValue() {
    return ApplicationManager(() => {}).getHashValue()
}
function neobookOnLoad() {
        ApplicationManager((event) => {
//            $('#login').css("display", "none")
              console.log("event.data=[" + event.data + "]")
        }).
        getargs(
        () => {
            thishref = $('#calendar').attr('data')
            console.log("Xthishref=[" + thishref + "]")
            return thishref
        },
        (newquery) => {
            $('#calendar').attr('data', newquery)
        })
}
function neoOnload() {
        console.log("neoOnload()")

        let AppMan = ApplicationManager((event, flag) => {
            if (typeof(flag) === "undefined") {
                $('#login').css("display", "none")
                console.log("event.data=[" + event.data + "]")
            } else
            if (flag == true) {
                $('#login').css("display", "block")
                console.log("event.data=[" + event.data + "]")
            }
        })
        AppMan.
        verify(
        () => {
            thishref = $('#login').attr('data')
            console.log("Xthishref=[" + thishref + "]")
            return thishref
        },
        (newquery) => {
            $('#login').attr('data', newquery)
        })

//        testCookie((token)=> {
//            if (token == null) {
//                $('#login').css("display", "block")
//            } else {
                $('#login').css("display", "none")
//            }
//        })

        neobookOnLoad()

        return AppMan;
}

