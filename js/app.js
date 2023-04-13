      function neoOnload() {
        testCookie()
        var hashValue = window.location.hash.slice(1)
        if ( typeof(hashValue) === 'undefined' ) {
            console.log("Start login (undefined)")
        } else
        if (hashValue.length <= 0) {
            console.log("Start login")
        } else {
            hashValue = "#" + hashValue
            console.log("hashvalue=[" + hashValue + "]")
        }
        function getServerURL() {
          const protocol = window.location.protocol;
          const server = window.location.host;
          const fileWithPath = window.location.pathname;
          const hashValue = window.location.hash;
          return protocol + "//" + server + fileWithPath + hashValue
        }
        const query = window.location.search
        const thishref = $('#login').attr('data')
        const newquery = thishref + hashValue + query + "&serverurl=" + getServerURL()
        console.log("query=[" + newquery + "]")
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
