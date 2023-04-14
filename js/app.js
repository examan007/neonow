     function getQueryValue(name) {
        const searchstr = window.location.href.split("?")[1]
        const searchParams = new URLSearchParams(searchstr);
        const value = searchParams.get(name)
        console.log("getQueryValue(); name=[" + name + "] value=[" + value + "] search=[" + searchstr + "]")
        $("#" + name).val(value)
        return value
      }
      function testCookie() {
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
          const cookieMap = parseCookie();
          var neotoken = cookieMap.get('neotoken')
          if (typeof(neotoken) === 'undefined') {
            neotoken = getQueryValue('neotoken')
          }
          console.log("cookie: [" + neotoken + "]")
          return neotoken
      }
      function neoOnload() {
        console.log("href=[" + window.location.href + "]")
        const token = testCookie()
        const protocol = window.location.protocol;
        const server = window.location.host;
        const fileWithPath = window.location.pathname;
        //const hashValue = window.location.hash.split("?")[0];
        var hashValue = window.location.hash.slice(1).split("?")[0];
        const searchstr = window.location.href.split("?")[1]
        if ( typeof(hashValue) === 'undefined' ) {
            console.log("Start login (undefined)")
        } else
        if (hashValue.length <= 0) {
            console.log("Start login")
        } else {
            console.log("hashvalue=[" + hashValue + "]")
        }
        function getServerURL() {
          return protocol + "//" + server + fileWithPath + hashValue
        }
        function removeLeadingChar(string, char) {
          if (string.startsWith(char)) {
            return string.substring(1);
          } else {
            return string;
          }
        }
        const thishref = $('#login').attr('data')
        const newquery = thishref + "?name=value&" + searchstr +
         "&serverurl=" + getServerURL()
        console.log("$$$ query=[" + newquery + "]")
        $('#login').attr('data', newquery)

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
                const token = JSON.parse(message).token
                console.log("token=[" + token + "]")
                $.cookie('neotoken', token, { expires: 1 })
                console.log("Cookie set: [" + document.cookie + "] token=[" + token + "]")
              } catch (e) {
                console.log(e.toString())
                $('#login').css("display", "none")
              }
           }
        }
      }
