      function executeAJAX(amethod) {
        var xhttp = new XMLHttpRequest()
        xhttp.withCredentials = false;
        xhttp.onreadystatechange = function() {
           console.log("ready" + this.responseText)
           if (this.readyState == 4 && this.status == 200) {
              function parseResponse(response) {
                   var ret = {}
                   if(response) {
                       try {
                           ret = JSON.parse(response);
                       } catch(e) {
                           console.log("Respone is not json")
                           ret = response
                       }
                   }
                   return ret
              }
              amethod(parseResponse(this.responseText), this)
            } else {
               console.log(this)
            }
        }
        return xhttp
      }
      var thisemail = ""
      function postAPI(formData) {
          fetch('https://test.neolation.com/api', {
            method: 'POST',
            body: formData
          })
          .then(response => response.json())
          .then(data => console.log(data))
          .catch(error => console.error(error));
      }
      function getQueryValue(name) {
        const searchstr = window.location.href.split("?")[1]
        const searchParams = new URLSearchParams(searchstr);
        const value = searchParams.get(name)
        console.log("getQueryValue(); name=[" + name + "] value=[" + value + "] search=[" + searchstr + "]")
        try {
            if (value.length > 0) {
                $("#" + name).val(value)
            } else {

            }
        } catch (e) {
            console.log(e.toString())
        }
        return value
      }
      function getNextForm(section) {
          $("#email").val(thisemail)
          console.log($("#username").val())
          $("#Login").css("display", "none")
          $("#Login-pass").css("display", "none")
          $("#Newuser").css("display", "none")
          $("#Verify").css("display", "none")
          $("#" + section).css("display", "block")
      }
      function setEmail() {
          const formRaw = $('#Login-form').serialize();
          const formData = new URLSearchParams("?" + $('#Login-form').serialize())
          thisemail = formData.get('username')
          console.log("thisemail = " + thisemail)
          const xhr = new XMLHttpRequest();
          xhr.timeout = 5000;
          const url = 'https://test.neolation.com/notify';
          xhr.open('POST', url);
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
          xhr.onload = function() {
            if (xhr.status === 200) {
              console.log("response=[" + xhr.response + "] status=[" + xhr.status + "]")
              $('label[for="verification"]').text(xhr.response)
              getNextForm('Verify')
            } else {
            console.error(xhr.statusText);
            }
          };
          const data = formRaw  //formData.toString();
          const credential = formData.get('username') + ":" + formData.get('password')
          console.log("credential=[" + credential + "]")
          console.log("Login-form=[" + formRaw + "] [" + formData.toString() + "]");
          xhr.setRequestHeader("Authorization", "Basic " + btoa(credential))
          xhr.send(data);
      }
      function setCookieInParent (token) {
        // Get a reference to the parent window
        var parentWindow = window.parent;

        // Create a message object
        var message = token

        // Send the message to the parent window
        parentWindow.postMessage(message, "*");
        console.log("message posted [" + JSON.stringify(message) + "]")
      }

      function getAuthenticationCookie() {
          const xhr = new XMLHttpRequest();
          xhr.timeout = 5000;
          const url = 'https://test.neolation.com/auth';
          xhr.open('POST', url);
          xhr.setRequestHeader('Content-Type', 'application/json');
          function showHeader() {
            var headers = xhr.getAllResponseHeaders();
            var headerLines = headers.trim().split('\n');
            for (var i = 0; i < headerLines.length; i++) {
              console.log(headerLines[i]);
            }
          }
          function onLoadAuth () {
              const formRaw = $('#Login-form').serialize();
              console.log("formRaw=[" + formRaw + "]")
              const formData = new URLSearchParams("?" + $('#Login-form').serialize())
              return {
                thisemail: formData.get('username'),
                onLoad: function () {
                    if (xhr.status === 200) {
                      console.log("response=[" + xhr.response + "] status=[" + xhr.status + "]")
                      setCookieInParent(xhr.response)
                      $("#neotoken").val(JSON.parse(xhr.response).token)
                      const serverurl = formData.get('serverurl')
                      if (serverurl == null) {
                          $("#serverurl").val('https://illuminatinglaserandstyle.com/side.html#Booking')
                      } else {
                          $("#serverurl").val(serverurl)
                      }
                      showHeader()
                      setEmail()
                    } else {
                      console.log("status=[" + xhr.status + "]")
                      console.error(xhr.statusText);
                    }
                  }
                }
          }
          const onloadObject = onLoadAuth()
          xhr.onload = onloadObject.onLoad
          const thisemail = onloadObject.thisemail
          console.log("getAuthenticationCookie() with [" + thisemail + "]")
          const credential = thisemail + ":" + 'blockade'
          xhr.setRequestHeader("Authorization", "Basic " + btoa(credential))
          xhr.send()
      }
        function exitlogin() {
          // Get a reference to the parent window
          var parentWindow = window.parent;

          // Create a message object
          var message = {
            data: "Hello, parent window!"
          };

          // Send the message to the parent window
          parentWindow.postMessage(message, "*");
          console.log("message posted [" + JSON.stringify(message) + "]")
        }
        function verifyToken (token, right, left) {
            try {
                if (token.length <= 0) {
                    console("token length error.")
                } else
                if (token === "undefined") {
                    console("token undefined.")
                } else {
                    right(token)
                    return
                }
            } catch (e) {
                console.log(e.toString())
            }
            left()
        }

      function onload() {
        console.log("load href=[" + window.location.href + "]")

        const usernameBox = document.getElementById("username");
        const inputBox = document.getElementById("input-box");
        usernameBox.addEventListener("input", function() {
          if (this.value.length > 0) {
            inputBox.classList.add("faded");
          } else {
            inputBox.classList.remove("faded");
          }
        });


        thisemail = localStorage.getItem('email');
        urlemail = getQueryValue('username')
        getQueryValue('password')

        $('#username').focus()

        console.log("urlemail=[" + urlemail + "]")
        if (thisemail !== urlemail) {
          thisemail = urlemail;
          localStorage.setItem('email', thisemail);
        }
        function needAuth(token) {
            console.log("thisemail = " + thisemail)
            $("#email").val(thisemail)
            $("#serverurl").val(getQueryValue('serverurl'))
            $("#neotoken").val(token)

            getNextForm('Login')

        }
        verifyToken(getQueryValue('neotoken'), function () { exitlogin() }, (t)=> needAuth(t))
      }


