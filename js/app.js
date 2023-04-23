 var ApplicationManager = function() {
    return {
        getParameters: function () {
            const params = window.location.href.split("?")[1]
            if (typeof(params) === 'undefined') {
                return ""
            } else {
                return "?" + params
            }
        },
        getHashCode: function () {
            const hash = window.location.href.split("?")[0].split("#")[1]
            if (typeof(hash) === 'undefined') {
                return ""
            } else {
                return "#" + hash
            }
        },
        getServer: function () {
            const server = window.location.href.split("?")[0].split("#")[0]
            if (typeof(server) === 'undefined') {
                return ""
            } else {
                return server
            }
        }
    }
}

     function getQueryValue(name) {
        const searchstr = window.location.href.split("?")[1]
        const searchParams = new URLSearchParams(searchstr);
        const value = searchParams.get(name)
        console.log("getQueryValue(); name=[" + name + "] value=[" + value + "] search=[" + searchstr + "]")
        if (value != null) {
            $("#" + name).val(value)
        }
        return value
      }
      function setCookie(message) {
          const token = JSON.parse(message).token
          console.log("set token=[" + token + "]")
          $.cookie('neotoken', token, { expires: 1 })
          console.log("Cookie set: [" + document.cookie + "] token=[" + token + "]")
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
              if (typeof(neotoken) === 'undefined') {
                const token = getQueryValue('neotoken')
                callback(token)
                message = "{\"token\":\"" + token + "\" }"
                console.log("message=[" + message + "]")
                if (token != null) {
                    setCookie(message)
                }
              } else {
                $("#neotoken").val(neotoken)
                callback(neotoken)
              }
          } catch (e) {
            console.log(e.toString())
            callback(null)
          }
          return $("#neotoken").val()
      }
      function getHashValue () {
          const hashValue = window.location.href.split("?")[0].split("#")[1]
          if ( typeof(hashValue) === 'undefined' ) {
              console.log("Start login (undefined)")
          } else
          if (hashValue.length <= 0) {
              console.log("Start login")
          } else {
              console.log("hashvalue=[" + hashValue + "]")
              return "#" + hashValue
          }
          return ""
      }
        function removeLeadingChar(string, char) {
          if (string.startsWith(char)) {
            return string.substring(1);
          } else {
            return string;
          }
        }
      function neoOnload() {
        console.log("href=[" + window.location.href + "]")
        var hashValue = getHashValue()
        function getSearchStr() {
            const searchstr = window.location.href.split("?")[1]
            if (typeof(searchstr) === "undefined") {
                return ""
            } else {
                return "&" + searchstr
            }
        }
        function getServerURL() {
            const protocol = window.location.protocol;
            const server = window.location.host;
            const fileWithPath = window.location.pathname;
            return protocol + "//" + server + fileWithPath + hashValue
        }
        testCookie((token)=> {
            function getNeoToken () {
                if (token == null) {
                    return ""
                } else
                if (getQueryValue('neotoken') != null) {
                    return ""
                }
               try {
                   if (token.length <= 0) {
                        return ""
                   }
               } catch (e) {
                    return ""
               }
               console.log("token=[" + token + "]")
               return "&neotoken=" + token
           }
           const thishref = $('#login').attr('data')
           const newquery = thishref + "?name=value" + getSearchStr() +
           "&serverurl=" + getServerURL() + getNeoToken()
           console.log("$$$ query=[" + newquery + "]")
           $('#login').attr('data', newquery)
        })

        // Add an event listener for the message event
        window.addEventListener("message", receiveMessage, false);
        console.log("Adding event listener")

        function receiveMessage(event) {
          // Check if the message is coming from the expected origin
           console.log("origin=[" + JSON.stringify(event) + "]")
           if (event.isTrusted === true) {
              // Process the message data
              var message = event.data;
              console.log("Received message:", message);
              try {
                setCookie(message)
              } catch (e) {
                console.log(e.toString())
                $('#login').css("display", "none")
             }
           }
        }
      }
