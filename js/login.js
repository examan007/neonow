var LoginManager = function() {
    var console= {
        log: function(msg) {},
        error: function(msg) {}
    }
    var BookedEvents = null
    var SalonData = null
    function executeAJAX(amethod) {
        var xhttp = new XMLHttpRequest()
        xhttp.withCredentials = false;
        xhttp.onreadystatechange = function() {
           console.log("ready" + this.responseText)
           if (this.readyState == 4)
           if (this.status == 200) {
              function parseResponse(response) {
                   var ret = {}
                   if(response) {
                       try {
                           ret = JSON.parse(response);
                       } catch(e) {
                           console.log("Response is not json")
                           ret = response
                       }
                   }
                   return ret
              }
              amethod(parseResponse(this.responseText), this)
            } else
            if( this.status == 401){
               setCookieInParent('expired' + $('#neotoken').val())
                $('#neotoken').val("")
               //exitlogin()
            } else
            if( this.status == 0){
               //exitlogin()
            } else {
                console.log(this.status + " NOT 200 [" + this.toString() + "]")
                $('label[for="verification"]').text("Something went wrong; please try again later.")
                getNextForm('Verify')
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
      function getVerification() {
          var element = document.querySelector('label[for="verification"]');
          if (element) {
            return element.textContent
          } else {
            console.log("Element not found.");
            return ""
          }
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
                    return 'empty'
                } else {
                    return section
                }
            }
            if (testSectionName(section) != 'empty') {
                $('#login-window').css("display", "block")
                $("#" + section).css("display", "block")
                checkInputContainerHelper(section)
                showlogin()
            }
        } catch (e) {
            console.log(e.stack.toString())
        }
        if (section === "Verify") {
            if (getVerification() === 'Code:') {
                exitlogin()
            } else {
                showlogin()
            }
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
        function replaceValue(searchParams, parameterName, newValue) {
            if (searchParams.has(parameterName)) {
              searchParams.set(parameterName, newValue);
            } else {
              searchParams.append(parameterName, newValue);
            }
        }
        function getBooks(authentication) {
            console.log("getBooks() ...")
            const formData = getForms("")
            if (authentication === false) {
                replaceValue(formData, "username", "*")
            }
            const xhr = executeAJAX((jsondata)=> {
                jsondata.authentication = authentication
                window.parent.postMessage(JSON.stringify({
                    operation: 'readappointments',
                    data: jsondata
                }), "*");
                if (authentication === true) {
                    getBooks(false)
                } else {
                    BookedEvents = jsondata.events
                }
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
          const duration = formData.get('duration')
          replaceValue(formData, 'duration', (getNextValueIndex(null, duration) + 1) * 30)
          //formData.delete('olddatetime')
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
           if (xhr.readyState == 4)
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
          function filterForm(searchParams, parameterName) {
            try {
              if (searchParams.has(parameterName)) {
                const value = searchParams.get(parameterName)
                const newval = value.replace(/#Services/g, "#Booking")
                console.log("email: " + newval)
                searchParams.set(parameterName, newval)
              }
            } catch (e) {
                console.log(e.toString())
            }
              return searchParams
          }
          const data = filterForm(formData, "serverurl").toString();
          const credential = formData.get('username') + ":" + formData.get('password')
          console.log("credential=[" + credential + "]")
          console.log("Login-form=[" + formData.toString() + "]");
          xhr.setRequestHeader("Authorization", "Basic " + btoa(credential))
          try {
              console.log("About to send email notification.")
              console.log("email: " + data.toString())
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
                      function testForPendedEmailVerification() {
                        try {
                            const jsonobj = JSON.parse(xhr.response)
                            if (jsonobj.message.includes('Pending')) {
                               $('label[for="verification"]').text(jsonobj.message +
                                " Please check your email for verify message and click on Book appointment.")
                                return true
                            } else {
                                return false
                            }
                        } catch (e) {
                            console.log(e.stack.toString())
                        }
                        return false
                      }
                      if (testForPendedEmailVerification()) {
                          getNextForm('Verify')
                      } else {
                          setCookieInParent('expired' + $('#neotoken').val())
                          $('#neotoken').val("")
                          $("#renewflag").val(false)
                          getNextForm('Login', true)
                          showlogin()
                      }
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
        function setInitialValue(value, name) {
            try {
                var elements = document.querySelectorAll('input[name="' + name + '"]');
                elements.forEach((input)=> {
                    console.log("item: set initial value " + value)
                    input.value = value
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
                        setInitialValue(json.datetime, "olddatetime")
                        input.value = convertDateTime(json)
                    } else
                    if (name === 'message') {
                        console.log("skipping [" + name + "]")
                    } else {
                      input.value = json[name];
                    }
                }
            }
            initializeDuration()
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
        const durationlist = [
            "Duration is 30 minutes.",
            "Duration is 1 hour.",
            "Duration is 1.5 hours.",
            "Duration is 2 hours.",
            "Duration is 2.5 hours.",
            "Duration is 3 hours.",
            "Duration is 3.5 hours.",
            "Duration is 4 hours."
        ]
        function initializeDuration() {
            try {
                const inputs = document.querySelectorAll('input')
                inputs.forEach((input)=> {
                    if (input.getAttribute('name') === 'duration') {
                        console.log("item: initial " + input.outerHTML)
                        input.setAttribute('value', durationlist[0])
                    }
                })
            } catch (e) {
                console.log(e.stack.toString())
            }
        }
        function getNextValueIndex(upflag, current) {
            function getNext(index) {
                if (index < durationlist.length) {
                    const test = durationlist[index]
                    console.log("item test: " + test + "current: " + current)
                    if (test === current) {
                        console.log("item found: " + test)
                        if (upflag == null) {
                            return index
                        } else
                        if (upflag) {
                            if (index < durationlist.length - 1) {
                                return index + 1
                            } else {
                                return index
                            }
                        } else {
                            if (index > 0) {
                                return index -1
                            } else {
                                return index
                            }
                        }
                    } else {
                        return getNext(index + 1)
                    }
                } else {
                    return durationlist.length - 1
                }
            }
            return getNext(0)
        }
        function isDateTimeAvailable(events, available, datetime, duration, servicesstring) {
            // Convert datetime and duration to moment objects for easier
            const startDatetime = moment(datetime);
            const endDatetime = moment(datetime).add((duration + 1) * 30, 'minutes');
            console.log("item: datetime is " + datetime + " start=" + startDatetime)
            // Check for overlap with existing events
            if (events)
            for (const event of events) {
                // Convert FullCalendar event format to moment objects
                const eventStart = moment(event.start);
                const eventEnd = moment(event.end);
                // Check for overlap with the current event
                if (
                (startDatetime >= eventStart && startDatetime < eventEnd) ||
                (endDatetime > eventStart && endDatetime <= eventEnd) ||
                (startDatetime <= eventStart && endDatetime >= eventEnd)
                ) {
                    return false; // Overlapping event found
                }
            }
            function getSecondsSinceMidnight(date) {
                 const momentDate = moment(date);
                 const midnight = momentDate.clone().startOf('day');
                 const secondsSinceMidnight = momentDate.diff(midnight, 'seconds');
                 return secondsSinceMidnight
             }
             function setTimeOfDate(datetime, time) {
                 const date = datetime.format('YYYY-MM-DD')
                 return date + "T" + time
             }
             // Iterate through each event in the 'available' list
             var adminflag = true
             if (available)
             for (const availableEvent of available) {
                 console.log("item: available " + JSON.stringify(availableEvent))
                 // Convert FullCalendar event format to moment objects
                 const availableStart = getSecondsSinceMidnight(
                     setTimeOfDate(startDatetime, availableEvent.startTime))
                 const availableEnd = getSecondsSinceMidnight(
                     setTimeOfDate(endDatetime, availableEvent.endTime))
                 const startTime = getSecondsSinceMidnight(startDatetime)
                 const endTime = getSecondsSinceMidnight(endDatetime)
                 console.log("item: available is " + availableEnd + " end=" + endTime)

                 // Check for overlap with the current 'available' event
                 const sindex = servicesstring.indexOf(availableEvent.title)
                 if (sindex >= 0) {
                     adminflag = false
                     if (
                     (startTime >= availableStart && startTime < availableEnd) &&
                     (endTime > availableStart && endTime <= availableEnd)
                     ) {
                         return true; // Overlapping event found
                     }
                 }
             }
             if (adminflag && available) {
                return true
             }
             return false; // No overlapping events found
         }
         function registerControls() {
            document.querySelectorAll('.number-container').
              forEach((container)=> {
                const controls = container.querySelectorAll('.number-control')
                controls.forEach((control)=> {
                    console.log("item loop: " + control.outerHTML)
                    const item = control.querySelectorAll('i')[0]
                    if (item) {
                        console.log("item: " + item.outerHTML)
                        function getNextValue(upflag, current) {
                            return getNextValueIndex(upflag, current)
                        }
                        function getSelectedValue(selector, name) {
                            const inputs = container.parentNode.querySelectorAll(selector)
                            function testInput(index) {
                                if (index < inputs.length) {
                                    const input = inputs[index]
                                    if (input.getAttribute('name') === name) {
                                        console.log("item: input " + input.outerHTML)
                                        return $(input).val()
                                    } else {
                                        return testInput(index + 1)
                                    }
                                } else {
                                    return ""
                                }
                            }
                            return testInput(0)
                        }
                        function getServicesString() {
                            return getSelectedValue('div input', 'services')
                        }
                        function convertDate(datestr, duration) {
                            try {
                                var parsedDate = moment(datestr, "dddd, MMMM D, YYYY [at] h:mm A [EDT]");
                                var newMoment = parsedDate.add(duration, 'minutes');
                                return newMoment.format("YYYY-MM-DDTHH:mm:ss");
                            } catch (e) {
                                console.log(e.toString())
                                return ""
                            }
                        }
                        function getDateTime() {
                            const datestr = getSelectedValue('div input', 'datetime')
                            return convertDate(datestr, 0)
                        }
                        function updateValue(upflag) {
                            const box = container.querySelectorAll('.number-box input')[0]
                            const current = box.getAttribute("value")
                            console.log("item value: " + current)
                            const newindex = getNextValue(upflag, current)
                            const newcurrent = durationlist[newindex]
                            function showError() {
                                item.style.color = 'red'
                                box.style.color = 'red'
                                window.setTimeout(() => {
                                    item.style.color = 'white';
                                    box.style.color = 'white'
                                  }, 1000)
                            }
                            if (newcurrent === current) {
                                showError()
                            } else
                            if (isDateTimeAvailable(
                                BookedEvents, SalonData, getDateTime(), newindex, getServicesString()
                                )) {
                                box.setAttribute("value", newcurrent)
                            } else {
                                showError()
                            }
                        }
                        const classes = item.getAttribute("class")
                        if (classes.indexOf('fa-plus') >= 0) {
                            item.addEventListener("click", ()=> {
                                 console.log("item: add time: ")
                                updateValue(true)
                            })
                        } else
                        if (classes.indexOf('fa-minus') >= 0) {
                            item.addEventListener("click", ()=> {
                                 console.log("item: subtract time")
                                updateValue(false)
                            })
                        }

                    }
                })
            })
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
                        function getYPos() {
                            const ypos = jsonmsg.message.ypos
                            if (ypos < 200) {
                                return 200
                            }
                            return ypos
                        }
                        $("#login-window").css("top", getYPos() + "px");
                        if (getWindowDimensions().width > 800) {
                            $("#login-window").css("left", "550px");
                        }
                    } catch (e) {
                        console.log("showsection: " + e.toString())
                    }
                    function getSectionName() {
                        const section = jsonmsg.sectionname
                        try {
                            const services = getQueryValue("services")
                            console.log("GSN href=[" + window.location.href + "] services=[" + services + "]")
                        } catch (e) {
                            console.log(e.stack.toString())
                        }
                        if (false) { //section === 'Request') {
                            return 'Appoint'
                        } else {
                            return section
                        }
                    }
                    const sectionname = getSectionName()
                    if (sectionname === "Appoint" || sectionname === "Request") {
                        LastPanel = sectionname
                        getNextForm(sectionname) //"Select")
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
               if (jsonmsg.operation === "salonhours") {
                    console.log("item: salonhours")
                    SalonData = jsonmsg.data
               } else
               if (jsonmsg.operation === 'readservices') {
                    function getResource() {
                        try {
                            const resource = jsonmsg.resource
                            if (resource.length  >= 0) {
                                return resource
                            }
                        } catch (e) {
                            console.log(e.toString())
                            return "https://illuminatinglaserandstyle.com/data/services.json"
                        }
                    }
                    getData(
                        getResource(),
                        (data)=> {
                            window.parent.postMessage(JSON.stringify({
                                operation: 'readservices',
                                data: data
                            }), "*")
                            addOptions(data, 'template-input-container')
                            bindOptions()
                            registerControls()
                        })
                } else
                if (jsonmsg.operation === 'readappointments') {
                    if (jsonmsg.authentication === true) {
                        $('#renewflag').val('true')
                        getAuthenticationCookie()
                    }
                    getBooks(jsonmsg.authentication)
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
        function processCheckInputValue(element) {
            if (element.value.length > 0) {
                console.log("value exists.")
                element.helper.classList.add("faded");
            } else {
                element.helper.classList.remove("faded");
            }
        }
        function checkInputValue() {
            console.log("checkValue " + this)
            processCheckInputValue(this.worker)
        }
        function getLength(input) {
            try {
                if (input.value.length === 'undefined') {
                    return 0
                } else {
                    return input.value.length
                }
            } catch (e) {
                console.log(e.toString())
            }
            return 0
        }
        function processClickInput(element) {
            const services = getServices()
            const helper = element.helper
            const worker = element.worker
            if (getLength(worker) > 0) {
                helper.classList.remove("faded");
                window.setTimeout( ()=> { worker.value = "" }, 100)
                setServices(services.replace(worker.value, "").trim())
            } else {
                helper.classList.add("faded");
                worker.value = helper.value
                if (services.length > 0) {
                    setServices(services + " " + worker.value)
                } else {
                    setServices(worker.value)
                }
            }
        }
        function clickInputValue() {
            console.log("clickInputValue()")
            console.log(this)
            processClickInput(this)
        }
        function setOptionValueForClass(value, classname) {
            console.log("Setting ... [" + value + "]")
            const optionlist = document.querySelectorAll('.' + classname)
            optionlist.forEach((element)=> {
                console.log(element)
                if (element.name === CurrentSelectedName) {
                    console.log("Setting : " + element)
                    element.value = value
                    processCheckInputValue(element)
                } else {
                    element.value = ""
                    processCheckInputValue(element)
                }
            })
        }
        function setOptionValue(value) {
            setOptionValueForClass(value, 'input-treatment')
            setOptionValueForClass(value, 'input-option')
            setOptionValueForClass(value, 'input-other')
        }
        function clearOptionValue(flag, classname, button) {
            console.log("Clearing ... " + flag + " classname=[" + classname + "]")
            if (flag) {
                processClickOptionValue({
                    worker: null
                })
            }
            const optionlist = document.querySelectorAll('.' + classname)
            optionlist.forEach((element)=> {
                console.log("Clearing :" + element.outerHTML)
                if (element.name === CurrentSelectedName) {
                    console.log("Clearing: " + element.name)
                    if (flag) {
                        element.value = ""
                    }
                    processCheckInputValue(element)
                }
            })
            function getFormElement(inparent) {
                function getForm(parent) {
                    if (typeof(parent) === 'undefined') {
                        return null
                    } else
                    if (parent.tagName === 'form') {
                        return parent
                    } else
                    if (parent.parentNode) {
                        return getForm(parent.parentNode)
                    } else {
                        return null
                    }
                }
                const formelem = getForm(inparent)
                if (formelem) {
                    return formelem
                } else {
                    return inparent.closest('form')
                }
            }
            const formElement = getFormElement(button)
            const inputElement = formElement.querySelector('input[name="nextform"]')
            console.log("Clearing: " + inputElement.outerHTML)
            getNextForm(inputElement.value)
        }
        var CurrentSelectedName = ""
        function processClickOptionValue(thisnode) {
            const optionlist = document.querySelectorAll('.select-option')
            optionlist.forEach((workernode)=> {
                try {
                    const inputs = workernode.parentNode.getElementsByTagName('input')
                    const worker = inputs[0]
                    const helper = inputs[1]
                    if (worker === thisnode.worker) {
                        if (getLength(worker) <= 0) {
                            processClickInput(worker)
                        }
                        setOptionValue(helper.value)
                    } else
                    if (getLength(worker) > 0) {
                        processClickInput(worker)
                    }
                } catch (e) {
                    console.log(e.stack.toString())
                }
            })
        }
        function clickOptionValue() {
            console.log("clickOptionValue ...")
            console.log(this)
            processClickOptionValue(this)
        }
        function clickForOptions() {
            console.log("clickForOptions ...")
            console.log(this)
            CurrentSelectedName = this.parentNode.getElementsByTagName('input')[0].name
            console.log("Current=[" + CurrentSelectedName + "]")
            getNextForm("Option")
            //clickInputValue()
        }
        function clickForOther() {
            console.log("clickForOther ...")
            console.log(this)
            CurrentSelectedName = this.parentNode.getElementsByTagName('input')[0].name
            console.log("Current=[" + CurrentSelectedName + "]")
            getNextForm("Other")
            //clickInputValue()
        }
        function clickForTreatment() {
            console.log("clickForTreatment ...")
            console.log(this)
            CurrentSelectedName = this.parentNode.getElementsByTagName('input')[0].name
            console.log("Current=[" + CurrentSelectedName + "]")
            getNextForm("Treatment")
            //clickInputValue()
        }
        function checkInputContainerHelper(sectionname) {
            const section = document.getElementById('#' + sectionname)
            initInputContainerHelper(section, (input)=> {
                input.checkValue()
            }, "input-box", checkInputValue)
        }
        function initInputContainerHelper(parent, register, inputclass, checkmethod) {
            function getElements() {
                const selector = '.' + inputclass
                if (parent == null) {
                    return document.querySelectorAll(selector)
                } else {
                    return parent.querySelectorAll(selector)
                }
            }
            console.log("initInputContainerHelper for " + inputclass)
            const elements = getElements()
            elements.forEach((element)=> {
                try {
                    const inputs = element.parentNode.getElementsByTagName('input')
                    const worker = inputs[0]
                    const helper = inputs[1]
                    function setMembers(element) {
                        element.worker = inputs[0]
                        element.helper = inputs[1]
                        element.checkValue = checkmethod
                        register(element)
                    }
                    setMembers(worker)
                    setMembers(helper)
                } catch (e) {
                    console.log(e.stack.toString())
                }
            })
        }
        function cloneOptions(data, templateclass, addmethod) {
            const templates = document.querySelectorAll('.' + templateclass)
            console.log("Tab: " + templates.length)
            function processTemplate(index) {
                if (index < templates.length) {
                   const template = templates[index]
                    function processTab(index) {
                        if (index < data.tabs.length) {
                            const services = data.tabs[index].services
                            function processOption(count) {
                                if( count < services.length) {
                                    const option = services[count]
                                    if (option.name.length > 0) {
                                        console.log("Tab: ", JSON.stringify(option))
                                        addmethod(option, template)
                                        processOption(count + 1)
                                    }
                                }
                            }
                            processOption(0)
                        }
                    }
                    processTab(index)
                    processTemplate(index + 1)
                }
            }
            processTemplate(0)
        }
        function addOptions(data, templateclass) {
            cloneOptions(data, templateclass, (option, template)=> {
                console.log("Tab: Service option: " + JSON.stringify(option))
                const cloneSection = template.cloneNode(true)
                cloneSection.setAttribute("style", "display: block;")
                cloneSection.classList.remove(templateclass)
                cloneSection.innerHTML = eval('`' + cloneSection.innerHTML + '`')
                template.parentNode.appendChild(cloneSection)
                template.setAttribute("style", "display: none;")
            })
        }
        function getData(resource, callback) {
            function getSubstringBeforeLastSlash(url) {
                try {
                    var lastSlashIndex = url.lastIndexOf('/');
                    if (lastSlashIndex === -1) {
                        return url;
                    } else {
                        return url.substring(0, lastSlashIndex);
                    }
                } catch (e) {
                    console.log(e.stack.toString())
                }
                return url
            }
            console.log("getData")
            const server = getSubstringBeforeLastSlash(window.location.href)
            console.log("getData Getting: [" + server + "/" + resource + "]")
            const url = resource
            fetch(url)
              .then(response => {
                if (response.ok) {
                  return response.json();
                } else {
                  throw new Error("Failed to retrieve data. Status code: " + response.status);
                }
              })
              .then(data => {
                // Process the JSON data as needed
                console.log(JSON.stringify(data))
                callback(data);
              })
              .catch(error => {
                console.error("Error:", error);
                callback(null)
              });
              return this
        }
        function bindOptions() {
            initInputContainerHelper(null, (input)=> {
                input.addEventListener("input", input.checkValue)
                input.checkValue()
            }, "input-box", checkInputValue )
            initInputContainerHelper(null, (input)=> {
                input.addEventListener("click", input.checkValue)
            }, "input-select", clickInputValue)
            initInputContainerHelper(null, (input)=> {
                console.log("Registering for select-option")
                input.addEventListener("click", input.checkValue)
            }, "select-option", clickOptionValue)
            initInputContainerHelper(null, (input)=> {
                console.log("Registering for input-option")
                input.addEventListener("click", input.checkValue)
            }, "input-option", clickForOptions)
            initInputContainerHelper(null, (input)=> {
                console.log("Registering for select-other")
                input.addEventListener("click", input.checkValue)
            }, "input-treatment", clickForTreatment)
            initInputContainerHelper(null, (input)=> {
                console.log("Registering for select-other")
                input.addEventListener("click", input.checkValue)
            }, "input-other", clickForOther)
        }
    return {
        clearOption: function (flag, classname) {
            clearOptionValue(flag, classname)
        },
        getData: function (resource, callback) {
            getData(resource, callback)
        },
        onload: function () {
           console.log("load href=[" + window.location.href + "]")
            registerForEvents()
            const dialoguebuttonids=[
                "done-input-treatment",
                "clear-input-treatment",
                "done-input-option",
                "clear-input-option",
                "done-input-other",
                "clear-input-other",
            ]
            function registerButton(index) {
                if (index < dialoguebuttonids.length) {
                    const buttonid = dialoguebuttonids[index]
                    const idarray = buttonid.split('-')
                    function getflag() {
                        if (idarray[0] === "done") {
                            return false
                        } else {
                            return true
                        }
                    }
                    function registerButtonClick() {
                        const button = document.getElementById(buttonid);
                        button.addEventListener('click', function (event) {
                          event.stopPropagation();
                          console.log('Button clicked!');
                          clearOptionValue(getflag(), idarray[1] + '-' + idarray[2], button)
                        })
                    }
                    registerButtonClick()
                    registerButton(index + 1)
                }
            }
            try {
                registerButton(0)
            } catch (e) {
                log.console(e.stack.toString())
            }
            function getServerURL() {
                 const url = getQueryValue('serverurl')
                 if (url == null) {
                    return ""
                 } else
                 if (url.indexOf("#Booking") >= 0) {
                    return url
                 } else {
                    const newurl = url.replace(/#Services?/g, "#Booking?")
                    const returl = newurl.replace(/html?/g, "html#Booking?")
                    console.log("returned url: " + returl)
                    return returl
                 }
            }
            const serverurl = getServerURL()
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
        setServices: function (nextpanel, obj) {
            console.log("setServices(); ")
            LastPanel = nextpanel
            console.log("setServices: " + obj.parentNode.outerHTML)
            console.log("setServices: [" + obj.value + "] nextpanel=[" + nextpanel + "]")
            function setNextForm (formname) {
                const section = document.getElementById(formname)
                const inputElement = section.querySelector('input[name="nextform"]')
                console.log("setServices: " + inputElement.outerHTML)
                if (inputElement) {
                    inputElement.value = nextpanel
                }
                console.log("setServices: " + section.outerHTML)
                getNextForm(formname)
            }

            if (obj.value.startsWith("Laser Treatment")) {
                setNextForm("Treatment")
            } else
            if (obj.value.startsWith("Hair Care Option")) {
                setNextForm("Option")
            } else
            if (obj.value.startsWith("Other Service")) {
                setNextForm("Other")
            } else
            if (obj.value.startsWith("Phone Consult")) {
                getNextForm("Select")
            } else {
                getNextForm("Select")
            }
        },
        doneServices: function () {
            console.log("doneServices(); ")
            getNextForm(LastPanel)
        }
    }
}


