  var LoginManager = function() {
    var console = {
        log: function(msg) {},
        error: function(msg) {},
    }
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
        console.log("query href=[" + window.location.href + "]")
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
      function getNextForm(section, flag) {
        //console.log("$$$%%%$$$ getNextForm $$$")
        $('#login-window').css("display", "none")
        $('.Dialogue').each( function () {
            $(this).css("display", "none")
            //console.log("section=[" + $(this).attr('id') + "]");
        })
        if (section === "Login") {
            $('#neotoken').val("")
            setCookieInParent("", flag)
        }
        try {
            $("#" + section).css("display", "block")
            if (section != 'empty') {
                $('#login-window').css("display", "block")
            }
            showlogin()
        } catch (e) {
        }
      }
        function getForms (extraparams, extended) {
            function getParameters(formname, delim) {
                try {
                   const formext = $(formname).serialize();
                   if (formext.length > 0) {
                        return delim + formext
                   }
                } catch (e) {
                    console.log(e.toString())
                }
                return ""
            }
            const formData = new URLSearchParams(getParameters('#Login-form', "?") +
                extraparams
                )
            const extData = new URLSearchParams(getParameters(extended, "?"))
            try {
                extData.forEach((value, key) => {
                    if (formData.get(key) != null) {
                        formData.set(key, value)
                    } else {
                        formData.append(key, value);
                    }
                });
            } catch {
                console.log(e.toString())
            }
            return formData
        }
            function getCredentials(formData) {
            const credential = formData.get('username') + ":" + formData.get('password')
            console.log("credential=[" + credential + "]")
            console.log("Login-form=[" + formData.toString() + "]");
            return credential
        }
        function getBooks(extended) {
            console.log("getBooks() ...")
            formData = getForms("", extended)
            const xhr = executeAJAX((jsondata)=> {
                window.parent.postMessage(JSON.stringify({
                    operation: 'readappointments',
                    data: jsondata
                }), "*");
            })
            const url = 'https://test.neolation.com/booking';
            xhr.open('POST', url);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            const data = formData.toString();
            xhr.setRequestHeader("Authorization", "Basic " + btoa(getCredentials(formData)))
            try {
                console.log("About to send booking request.")
                xhr.send(data);
            } catch (e) {
                console.log(e.toString())
            }
        }
      function setEmail(templatename, extended) {
          getNextForm("empty")
          function getParameters(formname, delim) {
            try {
               const formext = $(formname).serialize();
               if (formext.length > 0) {
                    return delim + formext
               }
            } catch (e) {
                console.log(e.toString())
            }
            return ""
          }
          const formData = new URLSearchParams(getParameters('#Login-form', "?") +
            '&templatename=' + templatename
            )
          const extData = new URLSearchParams(getParameters(extended, "?"))
          extData.forEach((value, key) => {
            if (formData.get(key) != null) {
                formData.set(key, value)
            } else {
                formData.append(key, value);
            }
          });

          thisemail = formData.get('username')
          function getNextSectionForm() {
            const nextform = formData.get('nextform')
            if (nexform == null) {
                return 'Verify'
            } else {
                return nextform
            }
          }
          console.log("thisemail=[" + thisemail + "] template=[" + templatename + "]")
          const xhr = new XMLHttpRequest();
          xhr.timeout = 5000;
          const url = 'https://test.neolation.com/notify';
          xhr.open('POST', url);
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
          xhr.onload = function() {
            if (xhr.status === 200) {
              console.log("response=[" + xhr.response + "] status=[" + xhr.status + "]")
              function getJsonobj() {
                  try {
                    const jsonmsg = JSON.parse(xhr.response)
                    $('label[for="verification"]').text(jsonmsg.response)
                    return jsonmsg
                  } catch (e) {
                    $('label[for="verification"]').text(xhr.response)
                  }
                  return {}
              }
              const jsonmsg = getJsonobj()
              try {
                  const messageobj = {
                      operation: "createevent",
                      data: jsonmsg,
                  }
                  function getJsonElement(jsonData, nameString) {
                    var names = nameString.split('.');
                    var element = jsonData;

                    for (var i = 0; i < names.length; i++) {
                     if (element[names[i]]) {
                       element = element[names[i]];
                     } else {
                       element = undefined;
                       break;
                     }
                    }
                    return element;
                  }
                 $(".response").each(function() {
                          $(this).val(getJsonElement(jsonmsg, $(this).attr('name')))
                  });
                  window.parent.postMessage(JSON.stringify(messageobj), "*");
              } catch (e) {
                console.log(e.toString())
              }
              if (templatename !== "verification.html") {
                  //exitlogin()
                  try {
                    getNextForm(jsonmsg.request.nextform)
                  } catch (e) {
                    getNextForm('Verify')
                  }
              } else {
               getNextForm('Verify')
              }
            } else
            if (xhr.status === 401) {
              setCookieInParent('expired')
              getNextForm('Login', true)
            } else {
                console.error(xhr.statusText);
                getNextForm('Login')
            }
          }
          const data = formData.toString();
          const credential = formData.get('username') + ":" + formData.get('password')
          console.log("credential=[" + credential + "]")
          console.log("Login-form=[" + formData.toString() + "]");
          xhr.setRequestHeader("Authorization", "Basic " + btoa(credential))
          try {
              console.log("About to send email notification.")
              xhr.send(data);
          } catch (e) {
            console.log(e.toString())
          }
      }
      function setCookieInParent (token, flag) {
        // Get a reference to the parent window
        var parentWindow = window.parent;
        // Create a message object
        var message = {
           token: token,
           login: flag
        }

        // Send the message to the parent window
        parentWindow.postMessage(JSON.stringify(message), "*");
        console.log("message posted [" + JSON.stringify(message) + "]")
      }

      function getAuthenticationCookie() {
          const xhr = new XMLHttpRequest();
          xhr.timeout = 5000;
          const url = 'https://test.neolation.com/auth';
          xhr.open('POST', url);
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
//          xhr.setRequestHeader('Content-Type', 'application/json');
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
                      console.log("new response=[" + xhr.response + "] status=[" + xhr.status + "]")
                      try {
                        const serverurl = formData.get('serverurl')
                        function testForNeoToken() {
                            const neotoken = formData.get('neotoken')
                            if (neotoken == null) {
                                return false
                            } else
                            if (typeof(neotoken) === "undefined") {
                                return false
                            } else
                            if (neotoken.length < 16) {
                                return false
                            } else
                            if( formData.get('renewflag') === "true") {
                                return false
                            }
                            return true
                        }
                        if (serverurl == null) {
                            $("#serverurl").val('https://illuminatinglaserandstyle.com/side.html#Booking')
                        } else {
                            $("#serverurl").val(serverurl)
                        }
                        response = JSON.parse(xhr.response)
                        const email = response.email
                        const token = response.token
                        if (typeof(token) !== "undefined") {
                          setCookieInParent(token)
                          $("#neotoken").val(token)
                        } else
                        if (testForNeoToken()) {
                           $("#renewflag").val(false)
                           console.log("token found status=[" + xhr.status + "]")
                        } else
                        if (typeof(email) !== "undefined") {
                          showHeader()
                          setEmail('verification.html')
                        } else {
                           console.log("status=[" + xhr.status + "]")
                        }
                      } catch (e) {
                        console.log(e.toString())
                      }
                    } else
                    if (xhr.status === 401) {
                      console.log("status=[" + xhr.status + "]")
                      console.log("status=[" + xhr.statusText + "]")
                      console.log("message=[" + xhr.response + "]")
                      setCookieInParent('expired')
                      $("#renewflag").val(false)
                      getNextForm('Login', true)
                    } else {
                      console.error(xhr.statusText);
                      $("#renewflag").val(false)
                      getNextForm('Login', true)
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
          const formData = new URLSearchParams("?" + $('#Login-form').serialize())
          xhr.send(formData.toString())
      }
        function exitlogin() {
          var message = {
            operation: "exitlogin"
          };
          window.parent.postMessage(JSON.stringify(message), "*");
          console.log("message posted [" + JSON.stringify(message) + "]")
        }
        function showlogin() {
          var message = {
            operation: "showlogin"
          };
          window.parent.postMessage(JSON.stringify(message), "*");
          console.log("message posted [" + JSON.stringify(message) + "]")
        }
        function closeSidebar() {
            const message = {
                operation: 'closesidebar',
            }
            try {
                window.parent.postMessage(JSON.stringify(message), "*");
                console.log("message posted [" + JSON.stringify(message) + "]")
            } catch (e) {
                console.log(e.toString())
            }
        }
        function verifyToken (token, right, left) {
            try {
                if (token === "undefined") {
                    console("token undefined.")
                } else
                if (token.length <= 0) {
                    console("token length error.")
                } else {
                    right(token)
                    return
                }
            } catch (e) {
                console.log(e.toString())
            }
            left()
        }
        function initHelpedInput(inputid, helpid) {
            const usernameBox = document.getElementById(inputid);
            const inputBox = document.getElementById(helpid);
            usernameBox.checkValue = function () {
              if (this.value.length > 0) {
                inputBox.classList.add("faded");
              } else {
                inputBox.classList.remove("faded");
              }
            }
            usernameBox.addEventListener("input", usernameBox.checkValue);
            usernameBox.checkValue()
        }
        function convertDateTime(jsonmsg) {
            const options = {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              timeZoneName: 'short'
            };
            const date = new Date(jsonmsg.datetime);
            const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
            console.log(formattedDate);
            return formattedDate
        }
        function setOldDateTime(datetime) {
            try {
                const input = document.getElementById('olddatetime')
                input.value = datetime
            } catch (e) {
                console.log(e.toString())
            }
        }
        function setInputValues(json) {
            var inputs = document.getElementsByTagName('input');
            for (var i = 0; i < inputs.length; i++) {
                const input = inputs[i];
                const name = input.getAttribute('name')
                if (json.hasOwnProperty(name)) {
                    if (name === 'datetime') {
                        setOldDateTime(json.datetime)
                        input.value = convertDateTime(json)
                    } else
                    if (name === 'message') {
                        console.log("skipping [" + name + "]")
                    } else {
                      input.value = json[name];
                    }
                }
            }
        }
        function getWindowDimensions () {
            const width = window.innerWidth;
            const height = window.innerHeight;
            //console.log(`Window size is ${width}x${height}`);
            return {
                width: width,
                height: height,
            }
        }
        function receiveMessage(event) {
          // Check if the message is coming from the expected origin
          console.log("rec mess")
           console.log("origin=[" + JSON.stringify(event) + "]")
           if (event.isTrusted === true) {
              // Process the message data

              var message = event.data;
              console.log("Received messageL:", message);
              try {
                const jsonmsg = JSON.parse(message)
                if (jsonmsg.operation === 'showsection') {
                    try {
                        setInputValues(jsonmsg)
                        initHelpedInput('usermessage','message-box')
                        $("#login-window").css("top", jsonmsg.message.ypos + "px");
                        if (getWindowDimensions().width > 800) {
                            $("#login-window").css("left", "550px");
                        }
                    } catch (e) {
                        console.log("showsection: " + e.toString())
                    }
                    getNextForm(jsonmsg.sectionname)
                } else
                if (jsonmsg.operation === 'showstatus') {
                    getNextForm('Status')
                } else
                if (jsonmsg.operation === 'tokenneeded') {
                    getNextForm('Login')
                } else
                if (jsonmsg.operation === 'readappointments') {
                    getBooks()
                }
              } catch (e) {
                console.log(e.toString())
                console.log(event.toString())
             }
           }
        }
        function registerForEvents() {
            // Add an event listener for the message event
            window.addEventListener("message", receiveMessage, false);
            console.log("Adding event listeners for login.")
            window.addEventListener("load", function() {
                console.log("Page load complete.")
                var message = {
                   operation: "loginpageloaded",
                }
                window.parent.postMessage(JSON.stringify(message), "*")
            })
        }
        registerForEvents()

    return {
        onload: function () {
           console.log("load href=[" + window.location.href + "]")
            const serverurl = getQueryValue('serverurl')
            urlemail = getQueryValue('username')
            initHelpedInput('username','input-box')
            initHelpedInput('usermessage','message-box')
            //thisemail = localStorage.getItem('email');
            getQueryValue('password')

            $('#username').focus()

            $('#login-window').on('click', function () {
                closeSidebar()
            })

            console.log("urlemail=[" + urlemail + "]")
            if (thisemail !== urlemail) {
              thisemail = urlemail;
              //localStorage.setItem('email', thisemail);
            }
            function needAuth(token) {
                console.log("thisemail = " + thisemail)
                $("#email").val(thisemail)
                $("#serverurl").val(serverurl)
                $("#neotoken").val(token)

                getNextForm('Login')
            }
            verifyToken(getQueryValue('neotoken'), (token)=> {
                exitlogin()
                setCookieInParent(token)
                console.log("$@#%@%@%@ Checking for renew flag.")
                if (getQueryValue('renewflag') == "true") {
                    getAuthenticationCookie()
                }
            }, (t)=> needAuth(t))
          document.getElementById("wrapper").addEventListener("click", function(event) {
            var rect = document.getElementById("login-window").getBoundingClientRect();
            var mouseX = event.clientX;
            var mouseY = event.clientY;
            if (
              mouseX >= rect.left &&
              mouseX <= rect.right &&
              mouseY >= rect.top &&
              mouseY <= rect.bottom
            ) {
              console.log("Coordinates are within the element.");
            } else {
              console.log("Coordinates are outside the element.");
              exitlogin()
            }
          });
        },
        exitlogin: function () {
            exitlogin()
        },

        getAuthenticationCookie: function () {
            getAuthenticationCookie()
        },
        requestAppointment: function () {
            setEmail('confirmation.html', '#Request-form')
        },
        changeAppointment: function () {
            setEmail('cancellation.html', '#Change-form')
        },
        showForm(sectionname) {
            getNextForm(sectionname)
        }
    }
}


