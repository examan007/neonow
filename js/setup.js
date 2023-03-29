

var makeSequence = function(thissequence) {

    function thislogger(message) {
        if (typeof element !== 'undefined') {
            GlobalLogger(message)
        }
    } // Debug off
//    var APPSRVR = "http://192.168.2.10"
    var ThisSequence = null
    var MaxSequence = 0
    var AccessToken = null

    function pad(num, size) {
        var s = "000000000" + num;
        return s.substr(s.length-size);
    }

    function getDateTime() {
        var currentdate = new Date();
        var datetime = currentdate.getDate() + "/"
                        + pad((currentdate.getMonth()+1), 2)  + "/"
                        + currentdate.getFullYear() + " @ "
                        + pad(currentdate.getHours(), 2) + ":"
                        + pad(currentdate.getMinutes(), 2) + ":"
                        + pad(currentdate.getSeconds(), 2);
        return datetime
    }
    function scrollToBottom() {
        window.scrollTo(0,document.body.scrollHeight);
    }
    function testNode(node, id, newval) {
        if (node.nodeType === 1) {
          var attr = node.getAttribute('id')
          if (attr === id) {
            // thislogger("Id=[" + id + "] Node=[" + attr + "] newval=[" + newval + "]");
            if (newval === id && newval.length > 0) {
              thislogger("Element found; [" + id + "]")
            } else
            if (id === 'element_details' || id === 'element_padding') {
              newval(node)
            } else
            if (id === 'element_execute' || id === 'element_toggle') {
              node.setAttribute('onclick', thissequence + "." + newval)
            } else
            if (id === 'sequence_template') {
              node.setAttribute('id', 'sequence_' + newval)
            } else
            if (id === 'element_image') {
              node.setAttribute('src', newval)
            } else {
              node.innerHTML = "" + newval
            }
            return true
          }
        }
        return false
    }

    function findNode(node, id, newval) {
        var ret = node
        if (node != null)
        if (testNode(node, id, newval) != true)
        if ((ret = findNode(node.firstChild, id, newval)) == null)
        ret = findNode(node.nextSibling, id, newval)
        return ret
    }

    function setDisplay(node, value) {
        node.style.display = value
    }

    function toggleDisplay(node) {
        if (node.style.display === "none") {
          setDisplay(node, "block")
        } else {
          setDisplay(node, "none")
        }
    }

    function isPended(test) {
        if (test == null) {
            thislogger("Unable to get status.")
            return false
        } else
        if (test.innerText !== "Pended") {
            thislogger("Status of [" + test.id + "]")
            return false
        } else {
            thislogger("Status of [" + test.id + "]")
            return true
        }
    }

    function getNode(id) {
      var node = document.getElementById(id)
      if (isPended(findNode(node, "element_status", "element_status")) == false) {
        thislogger("" + id + " has been already started.")
        node = null
      }
      return node
    }

    function runIfReady(element) {
        if (element !== null)
        if (typeof element.auto !== 'undefined')
        if (typeof element.method !== 'undefined')
        if (typeof element.name !== 'undefined')
        if (element.auto === 'true') {
            var node = getNode("sequence_" + element.name)
            if (node !== null) {
                executeFunctionByName(thissequence + "." + element.method, window, element.name);
            } else {
                thislogger("Unable to find valid node named [" + element.name + "]")
            }
        }
    }

    function renderElement(element) {
        var template = document.getElementById('sequence_template')
        if (typeof template !== 'undefined') {
            thislogger('Found element template; new name [' + element.name + ']')
            var clone = template.cloneNode(true)
//            findNode(template, 'element_status', 'Pended')
            findNode(clone, 'sequence_template', element.name)
            findNode(clone, 'element_name', element.name)
            findNode(clone, 'element_descr', element.descr)
            findNode(clone, 'element_execute', element.method + "(" + "\"" + element.name + "\")")
            findNode(clone, 'element_toggle', "toggleDetails(\"" + element.name + "\")")
            findNode(clone, 'element_image', element.image)
            findNode(clone, 'element_datetime', "")
            setDisplay(clone, "none");
            template.parentNode.appendChild(clone)
            runIfReady(element)
        } else {
            alert('Error, unable to find element template.')
        }
    }

    function getIndex(name, count) {
        var element = ThisSequence['sequence'][count]
        if (typeof element !== 'undefined') {
            if (element.name === name) {
                return count
            } else {
                return getIndex(name, count + 1)
            }
        } else {
            return -1
        }
    }

    function getElement(name, count) {
        var index = getIndex(name, count)
        if (index < 0) {
            return null
        } else {
            return ThisSequence['sequence'][index]
        }
    }

    function executeFunctionByName(functionName, context, args) {
      var args = Array.prototype.slice.call(arguments, 2);
      var namespaces = functionName.split(".");
      var func = namespaces.pop();
      for(var i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]];
      }
      return context[func].apply(context, args);
    }

    function setCompleteStatus(node, name) {
        findNode(node, 'element_status', 'Complete')
        findNode(node, 'element_datetime', getDateTime())
        var element = getElement(name, 0)
        if (element !== null) {
            if (element.auto !== "true") {
                thislogger("NO auto next in seqeunce.")
            } else {
                var index = getIndex(name, 0) + 1
                thislogger("index=" + index + " size=" + MaxSequence)
                if (index >= 0 && index < MaxSequence) {
                    var next = ThisSequence['sequence'][index]
                    var distinct = thissequence + "." + next.method
                    thislogger("Next in sequence is [" + distinct + "(" + next.name + ")]")
                    runIfReady(getElement(next.name, 0))
                } else {
                    setCompleteStatus(document.getElementById('sequence_template'), 'Sequence')
                }
            }
        } else {
            thislogger("End of sequence name used [" + name + "]")
            var template = document.getElementById('sequence_template')
            if (typeof template !== 'undefined') {
                var clone = template.cloneNode(true)
                findNode(clone, 'sequence_template', 'Complete')
                setDisplay(clone, "none");
                template.parentNode.appendChild(clone)
            } else {
                alert('Error, unable to find element template to complete')
            }
        }
    }

    function setRunningStatus (node) {
          findNode(node, 'element_status', 'Running')
          setDisplay(node, "block")
          scrollToBottom()
    }

    function getSSM() {
        var now = new Date(),
            then = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                0,0,0),
            diff = now.getTime() - then.getTime(); // difference in milliseconds
            return diff;
    }

    function executeAJAX(amethod) {

      var xhttp = new XMLHttpRequest()
      xhttp.withCredentials = false;
      xhttp.onreadystatechange = function() {
         if (this.readyState == 4 && this.status == 200) {
            function parseResponse(response) {
                 var ret = {}
                 if(response) {
                     try {
                         ret = JSON.parse(response);
                     } catch(e) {
                         thislogger(response)
                         ret = response
                     }
                 }
                 return ret
            }
            amethod(parseResponse(this.responseText), this)
          } else {
             thislogger(this)
          }
      }
      return xhttp
    }

    function completeResponse(node, response) {
        findNode(node, 'element_details', function (element) {
            var separator = ""
            if (element.innerHTML.length > 0) {
                serarator = "<br>"
            }
            element.innerHTML = "" + element.innerHTML + separator + JSON.stringify(response)
        })
        scrollToBottom()
    }

    return {
        getData: function() {
          var node = getNode("sequence_template")
          if (node == null) {
            return
          }
          function processAJAX(response) {
             var separator = ""
             function addElement (count) {
                if (count > 0) {
                  separator = "|"
                }
                var element = list['sequence'][count]
                if (typeof element !== 'undefined') {
                    renderElement(element)
                    return separator + element.name  + addElement(++count)
                } else {
                    MaxSequence = count;
                    return ""
                }
             }
             var list = response
             if (typeof list !== 'undefined') {
               ThisSequence = list
               findNode(node, 'element_content', addElement(0))
             } else {
               findNode(node, 'element_content', "Error, cannot get sequence")
             }
             completeResponse(node, response)
             setRunningStatus(node)
          }
          var xhttp = executeAJAX(processAJAX)
          xhttp.open("GET", "https://illuminatinglaserandstyle.com/html/data/sequence.json",
           true, { rejectUnauthorized: false });
          xhttp.send();
        },

        loadDoc: function(name) {
          var node = getNode("sequence_" + name)
          if (node == null) {
            return
          }
          function processAJAX(response) {
            var response_status = response.status
            if (typeof response_status === 'undefined') {
                response_status = ""
            }
             findNode(node, 'element_content', response_status)
             completeResponse(node, response)
             setCompleteStatus(node, name)
          }
          var xhttp = executeAJAX(processAJAX)
          setRunningStatus(node)
          findNode(node, 'element_details', function (element) { element.innerHTML = "" })
          xhttp.withCredentials = false;
          xhttp.open("GET", "https://test.neolation.com/home",
           true, { rejectUnauthorized: false });
          xhttp.send();
        },

        authenticate: function(name) {
          var node = getNode("sequence_" + name)
          if (node == null) {
            return


          }
          console.log("$$$$HERE$$$$")
          var element = getElement('Login', 0)
          function processAJAX(response, xhttp) {
            //AccessToken = response.response['accessToken']
            //const AccessToken = xhttp.getResponseHeader('X-Access-Token')
            var displaystr = ""
            if (AccessToken === null) {
                displaystr = ""
            } else {
                displaystr = AccessToken.substring(0, 32)
            }
            findNode(node, 'element_content', displaystr)
            completeResponse(node, response)
            setCompleteStatus(node, name)
          }
          var xhttp = executeAJAX(processAJAX)
          setRunningStatus(node)
          //findNode(node, 'element_details', function (element) { element.innerHTML = "" })
          xhttp.open("POST", "https://test.neolation.com/api",
           true, { rejectUnauthorized: false });
          xhttp.setRequestHeader("Authorization", "Basic " + btoa(element.username + ":" + element.password))
          xhttp.send()
        },

        executeRemote: function(name) {
          if (AccessToken == null) {
            return
          }
          var node = getNode("sequence_" + name)
          if (node == null) {
            return
          }
          var element = getElement(name, 0)
          function processAJAX(response) {
            var displaystr = "" + JSON.stringify(response)
           var content = displaystr.substring(0, 80)
           if (typeof content === 'undefined') {
                content = ""
           }
            if ( typeof response.payload === 'undefined') {
               findNode(node, 'element_status', 'Failed')
               findNode(node, 'element_content', content)
            } else {
                if ( typeof response.payload[0] === 'undefined') {
                   displaystr = "" + JSON.stringify(response['status'])
                } else {
                   displaystr = "" + JSON.stringify(response['payload'][0][element.field])
                }
               findNode(node, 'element_content', content)
               setCompleteStatus(node, name)
            }
            completeResponse(node, response)
          }
          var xhttp = executeAJAX(processAJAX)
          setRunningStatus(node)
          xhttp.open("POST", "restapi/dataProtection",
           true, { rejectUnauthorized: false });
          var requeststr = JSON.stringify({
                                     metainfo:{
                                       requestType:"query",
                                       jsonType:"request",
                                       environment:"DEMO",
                                       sendingTopic:"TALISTEN",
                                       receivingTopic:"return" + getSSM(),
                                       timeout:172800,
                                       authorization:{
                                         accessToken: AccessToken
                                       },
                                       targetFunction:"DA"
                                     },
                                     payload: element.remote, //"{\"query\":\"@dp version\"}",
                                     signature:"10866a4f92a88b1bfbf53889741a899684b018b6e0b02a8c05ed413ece16e2ea"
                                   })
          findNode(node, 'element_details', function (element) {
              element.innerHTML = "" + element.innerHTML + requeststr
          })
          xhttp.send(requeststr)

        },

        toggleDetails: function(name) {
          var root = document.getElementById("sequence_" + name)
          function toggler() {
              return function(node) {
                if (node.style.display === "none") {
                  node.style.display = "block"
                } else {
                  node.style.display = "none"
                }
              }
          }
          findNode(root, 'element_details', new toggler())
          findNode(root, 'element_padding', new toggler())
        },

        setLoggerFunction: function(logger) {
            thislogger = logger
        }
    }
}
