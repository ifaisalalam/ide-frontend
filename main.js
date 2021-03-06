$(document).ready(function()
{
    $('#submitButton').on('click', function(){
        var value = window.editor.getValue();
        if(value.length!=0)
        {
            $('#ide-form').submit();
            $(".fa-play").addClass("d-none");
            $("#submitButton").attr("disabled","true");
        }
        else
        {
            alert ("Nothing to Process!");
            $(".sub-btn").blur(); 
        }
    });

    $('#ide-form').on('submit', function(e)
    {
        e.preventDefault();
        var value = window.editor.getValue();

        
        $('#codearea').val(value);   
        $(".sub-btn").addClass("disabled");
        $(".fa-refresh").removeClass("d-none");
        $("#success-result").text('');
        $("#compile_stderr-result").text('');
        $("#stderr-result").text('');
        $("#stdTime").text('');
        var formData = new FormData(e.target);
        var object = {};
        formData.forEach(function(value, key){
            object[key] = value;
        });


        // ajax call
        $.ajax({
            type: 'POST',
            contentType: 'application/json',
            url: 'https://ide.ctfhub.io/api/new',
            data : JSON.stringify(object),
            dataType: "json",
            success: function(res)
            {
                if(res['status']=='success')
                {
                    $(".ide-result").removeClass("d-none");
                    callback_url = res['data'].callbackUrl;

                    var callback = (data, error) => {
                        // consume data
                        var statustext = 'ERROR : ';
                        var succesStatusText = 'OUTPUT : ';
                        var stdTime = 'Time : ';
                        if (error) {
                            console.error(error);
                            return;
                        }
                        else
                        {
                            if(data.stdout.length!=0)
                            {
                                $("#success-result").text(succesStatusText+data.stdout);
                                statustext = 'WARNING : ';
                            }
                            
                            if(data.compile_stderr.length!=0)
                            {
                                $("#compile_stderr-result").text(statustext+data.compile_stderr);
                            }
                            
                            if(data.stderr.length!=0)
                            {
                                $("#stderr-result").text(statustext+data.stderr);
                            }
                           
                            if(data.time_log.length!=0)
                            {
                                $("#stdTime").text(stdTime+data.time_log);
                            }


                        }
                        $(".fa-refresh").addClass("d-none");
                        $(".sub-btn").removeClass("disabled");
                        $(".fa-play").removeClass("d-none");
                        $(".sub-btn").blur(); 
                        $("#submitButton").removeAttr("disabled");
                    };

                    function sleep(ms) {
                        return new Promise(resolve => setTimeout(resolve, ms));
                    }

                    // set upper bound
                    request(200, callback);

                    async function request(retries, callback) {
                        await sleep(1000);
                        axios.get(callback_url)
                        .then(response => {
                            if(response['data'].status != 'pending') {
                                // request successful, deliver to script for consume
                                callback(response['data']);
                            }
                            else {
                                // request failed
                                // retry, if any retries left
                                if (retries > 0) {
                                    request(--retries, callback);
                                }
                                else {
                                    // no retries left, calling callback with error
                                    alert('Please submit Again!');
                                    callback([], "out of retries");
                                    $(".fa-refresh").addClass("d-none");
                                    $(".sub-btn").removeClass("disabled");
                                    $(".fa-play").removeClass("d-none");
                                    $(".sub-btn").blur(); 
                                    $("#submitButton").removeAttr("disabled");
                                }
                            }
                        }).catch(error => {
                            // ajax error occurred
                            // would be better to not retry on 404, 500 and other unrecoverable HTTP errors
                            // retry, if any retries left
                            if (retries > 0) {
                                request(--retries, callback);
                            }
                            else {
                                // no retries left, calling callback with error
                                callback([], error);
                                alert('Please Submit Again!');
                                $(".fa-refresh").addClass("d-none");
                                $(".sub-btn").removeClass("disabled");
                                $(".fa-play").removeClass("d-none");
                                $(".sub-btn").blur(); 
                                $("#submitButton").removeAttr("disabled");
                            }
                        });
                    }
                }
                else{
                    $(".fa-ide-result").removeClass("d-none");
                    $("#result").text('error..failed to connect with ngrok..');
                    $(".fa-refresh").addClass("d-none");
                    $(".sub-btn").removeClass("disabled");
                    $(".fa-play").removeClass("d-none");
                    $(".sub-btn").blur(); 
                    $("#submitButton").removeAttr("disabled");
                }

            },
            error: function (jqXHR, exception)
            {
                var msg = '';
                if (jqXHR.status === 0) {
                    msg = 'Not connect.\nVerify Network.';
                } else if (jqXHR.status == 404) {
                    msg = 'Requested page not found. [404]';
                } else if (jqXHR.status == 500) {
                    msg = 'Internal Server Error [500].';
                } else if (exception === 'parsererror') {
                    msg = 'Requested parse failed.';
                } else if (exception === 'timeout') {
                    msg = 'Time out error.';
                } else if (exception === 'abort') {
                    msg = 'Ajax request aborted.';
                } else {
                    msg = 'Uncaught Error.\n' + jqXHR.responseText;
                }
                alert(msg);
                $(".fa-refresh").addClass("d-none");
                $(".sub-btn").removeClass("disabled");
                $(".fa-play").removeClass("d-none");
                $(".sub-btn").blur(); 
                $("#submitButton").removeAttr("disabled");
            }
        });
    
    });

});

function showCustomInputBox() {
    // Get the checkbox
    var checkBox = document.getElementById("custom-input");
    // Get the output text
    var custom_input_area = document.getElementById("custominputarea");

    var resultBox = document.getElementById("result-box");

    // If the checkbox is checked, display the custom input box
    if (checkBox.checked == true){
        custom_input_area.classList.remove("d-none");
        resultBox.style.height = "300px";
    } else {
        custom_input_area.classList.add("d-none");
        custom_input_area.value=null;
        resultBox.style.height = "535px";
    }
}

showCustomInputBox();