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
        console.log("$$$%%%$$$ getNextForm $$$ section=[" + section + "]")
        $('#login-window').css("display", "none")
        $('.Dialogue').each( function () {
            $(this).css("display", "none")
            //console.log("section=[" + $(this).attr('id') + "]");
        })
        if (section === "X-Login") {
            $('#neotoken').val("")
            setCookieInParent("", flag)
        }
        try {
            function testSectionName(section) {
                if (typeof(section) === 'undefined') {
                    return empty
                } else {
                    return section
                }
            }
            if (testSectionName(section) != 'empty') {
                $('#login-window').css("display", "block")
                $("#" + section).css("display", "block")
                checkInputContainerHelper(section)
                showlogin()
            } else {
                exitlogin()
            }
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
            function getExtraParams(form, params) {
                try {
                    if (params.length > 0) {
                        form.append(params.split('=')[0], params.split('=')[1])
                    }
                } catch (e) {
                    console.log(e.toString())
                }
            }

            const formData = new URLSearchParams(getParameters('#Login-form', "?"))
            getExtraParams(formData, extraparams)
            try {
                const extData = new URLSearchParams(getParameters(extended, "?"))
                extData.forEach((value, key) => {
                    if (formData.get(key) != null) {
                        formData.set(key, value)
                    } else {
                        formData.append(key, value);
                    }
                });
            } catch {
                console.log("get extended parmas: " + e.toString())
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
            const formData = getForms("", extended)
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
                //showlogin()
            }
        }
      function setEmail(templatename, extended) {
          getNextForm("empty")
          const formData = getForms('templatename=' + templatename, extended)
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
                    console.log("message: [" + JSON.stringify(jsonmsg) + "]")
                    setInputValues(jsonmsg)
                    getNextForm(jsonmsg.request.nextform)
                  } catch (e) {
                    getNextForm('Verify')
                  }
              } else {
               getNextForm('Verify')
              }
            } else
            if (xhr.status === 401) {
              setCookieInParent('expired' + $('#neotoken').val())
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

      function getAuthenticationCookie(extended) {
          const formData = getForms("", extended)
          console.log("formData=[" + formData.toString() + "]")
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
                        const templatename = getTemplateName()
                        function getTemplateName() {
                            const temp = formData.get('template')
                            if (temp == null) {
                            } else
                            if (typeof(temp) === 'undefined') {
                            } else
                            if (temp.length > 0) {
                                return temp
                            }
                            return 'verification.html'
                        }
                        if (typeof(token) !== "undefined") {
                          console.log("Token found.")
                          setCookieInParent(token)
                          $("#neotoken").val(token)
                          if (typeof(extended) !== 'undefined') {
                            setEmail(templatename, extended)
                          }
                        } else
                        if (testForNeoToken()) {
                           $("#renewflag").val(false)
                           console.log("token found status=[" + xhr.status + "]")
                        } else
                        if (typeof(email) !== "undefined") {
                            console.log("email defined")
                            showHeader()
                            if (typeof(extended) !== 'undefined') {
                              setEmail(templatename, extended)
                            } else {
                              setEmail('verification.html')
                            }
                        } else {
                           console.log("status=[" + xhr.status + "]")
                        }
                      } catch (e) {
                        console.log(e.stack.toString())
                      }
                    } else
                    if (xhr.status === 401) {
                      console.log("status=[" + xhr.status + "]")
                      console.log("status=[" + xhr.statusText + "]")
                      console.log("message=[" + xhr.response + "]")
                      setCookieInParent('expired' + $('#neotoken').val())
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
                var elements = document.querySelectorAll('input[name="olddatetime"]');
                elements.forEach((input)=> {
                    input.value = datetime
                })
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
                        console.log("message: [" + JSON.stringify(jsonmsg) + "]")
                        setInputValues(jsonmsg)
                        $("#login-window").css("top", jsonmsg.message.ypos + "px");
                        if (getWindowDimensions().width > 800) {
                            $("#login-window").css("left", "550px");
                        }
                    } catch (e) {
                        console.log("showsection: " + e.toString())
                    }
                    function getSectionName() {
                        const section = jsonmsg.sectionname
                        if (false) { //section === 'Request') {
                            return 'Appoint'
                        } else {
                            return section
                        }
                    }
                    const sectionname = getSectionName()
                    if (sectionname === "Appoint" || sectionname === "Request") {
                        LastPanel = sectionname
                        getNextForm("Select")
                    } else {
                        getNextForm(sectionname)
                    }
                } else
                if (jsonmsg.operation === 'showstatus') {
                    getNextForm('Status')
                } else
                if (jsonmsg.operation === 'tokenneeded') {
                    getNextForm('Login')
                } else
                if (jsonmsg.operation === 'readappointments') {
                    $('#renewflag').val('true')
                    getAuthenticationCookie()
                    getBooks()
                }
              } catch (e) {
                console.log(e.stack.toString())
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
        function setServices(newvalue) {
            const services = document.querySelectorAll('input[name="services"]')
            services.forEach((element)=> {
                console.log("services=[" + newvalue + "]")
                element.value = newvalue
                element.checkValue()
            })
        }
        function getServices() {
            try {
                const services = document.querySelectorAll('input[name="services"]')
                return services[0].value
            } catch (e) {
                console.log(e.toString())
            }
            return ""
        }
        function checkInputValue() {
            console.log("checkValue " + this.value)
            if (this.value.length > 0) {
                console.log("value exists.")
                this.helper.classList.add("faded");
            } else {
                this.helper.classList.remove("faded");
            }
        }
        function clickInputValue() {
            console.log("clickInputValue()")
            var services = getServices()
            if (this.value.length > 0) {
                this.helper.classList.remove("faded");
                window.setTimeout( ()=> { this.value = "" }, 500)
                services = services.replace(this.value, "").trim()
            } else {
                this.helper.classList.add("faded");
                this.value = this.helper.value
                if (services.length > 0) {
                    services = services + " " + this.value
                } else {
                    services = this.value
                }
            }
            setServices(services)
        }
        function checkInputContainerHelper(sectionname) {
            const section = document.getElementById('#' + sectionname)
            initInputContainerHelper(section, (input)=> {
                input.checkValue()
            }, "input-box", checkInputValue)
        }
        function initInputContainerHelper(parent, register, inputclass, checkmethod) {
            function getElements() {
                if (parent == null) {
                    return document.querySelectorAll('.input-container')
                } else {
                    return parent.querySelectorAll('.input-container')
                }
            }
            const elements = getElements()
            elements.forEach((element)=> {
                try {
                    const inputs = element.getElementsByTagName('input')
                    const input = inputs[0]
                    if (input.classList.contains(inputclass)) {
                        input.helper = inputs[1]
                        input.checkValue = checkmethod
                        register(input)
                    }
                } catch (e) {
                    console.log(e.stack.toString())
                }
            })
        }

    return {
        onload: function () {
           console.log("load href=[" + window.location.href + "]")
            registerForEvents()
            initInputContainerHelper(null, (input)=> {
                input.addEventListener("input", input.checkValue)
                input.checkValue()
            }, "input-box", checkInputValue )
            initInputContainerHelper(null, (input)=> {
                input.addEventListener("click", input.checkValue)
            }, "input-select", clickInputValue)

            const serverurl = getQueryValue('serverurl')
            urlemail = getQueryValue('username')
            getQueryValue('password')

            $('#username').focus()

            $('#wrapper').on('click', function () {
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
                //setCookieInParent(token)
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
          getNextForm('empty')

          return this
        },
        exitlogin: function () {
            exitlogin()
        },

        getAuthenticationCookie: function () {
            getAuthenticationCookie()
        },
        verifyAppointment: function () {
            try {
                var parent = document.getElementById('Appoint')
                var sourceElement = parent.querySelectorAll('input[name="email"]')[0]
                var targetElement = document.getElementById("username")
                var sourceValue = sourceElement.value
                targetElement.value = sourceValue
                console.log('Appointment: email=[' + sourceValue + ']')
            } catch (e) {
                console.log(e.stack.toString())
            }
            getAuthenticationCookie('#Appoint-form')
        },
        requestAppointment: function () {
            setEmail('confirmation.html', '#Request-form')
        },
        changeAppointment: function () {
            setEmail('cancellation.html', '#Change-form')
        },
        showForm: function (sectionname) {
            getNextForm(sectionname)
        },
        LastPanel: "",
        setServices: function (nextpanel) {
            console.log("setServices(); ")
            LastPanel = nextpanel
            getNextForm("Select")
        },
        doneServices: function () {
            console.log("doneServices(); ")
            getNextForm(LastPanel)
        }
    }
}


