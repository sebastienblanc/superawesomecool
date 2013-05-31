var pushNotification,
    senderId = "551917860768", //this is the project number from the api console,
    pushAppId = "8a5659fc3ef65306013ef68e3c070012", //this is the id of the android variant
    pushServerUrl = "http://keynotepushserver-lholmqui.rhcloud.com/ag-push/rest/registry/device", //the url of the push server
    mapOptions,
    map, 
    app = {
        initialize: function() {
            this.bind();
           
        },
        bind: function() {
            document.addEventListener('deviceready', this.deviceready, false);
        },
        deviceready: function() {
            // note that this is an event handler so the scope is that of the event
            // so we need to call app.report(), and not this.report()
            app.report('deviceready');
            app.startPush();
        },
        report: function(id) {
            console.log("report:" + id);
           
        },
        startPush: function() {
        	 mapOptions  = {
                     center: new google.maps.LatLng(-34.397, 150.644),
                     zoom: 8,
                     mapTypeId: google.maps.MapTypeId.ROADMAP
                 };
             map =  new google.maps.Map(document.getElementById("map-canvas"),
                     mapOptions);
            console.log( "starting Push" );
            pushNotification = window.plugins.pushNotification;
            var success, error;

            success = function (result) {
                console.log( "success", success );
            };

            error = function (error) {
                console.log(  "error", error );
            };

            //Just doing android,  so probably don't need this
            if (device.platform == 'android' || device.platform == 'Android') {

                // required!
                pushNotification.register( success, error, { "senderID": senderId, "ecb": "onNotificationGCM" } );
            }
        }
    };





// handle GCM notifications for Android
function onNotificationGCM(e) {
	
    switch( e.event )
    {
        case 'registered':
        if ( e.regid.length > 0 )
        {
            //$("#app-status-ul").append('<li>REGISTERED -> REGID:' + e.regid + "</li>");
            // Your GCM push server needs to know the regID before it can push to this device
            // here is where you might want to send it the regID for later use.
            console.log("regID = " + e.regid);
            var userRegData = {
                "deviceToken": e.regid,
                "deviceType": "ANDROID",
                "mobileOperatingSystem": "android"
            };

            $.ajax( {
                url: pushServerUrl,
                type: "POST",
                contentType: "application/json",
                headers: { "ag-mobile-app": pushAppId },
                data: JSON.stringify( userRegData ),
                success: function( response ) {
                	console.log( response );
                },
                error: function( response ) {
                	console.log( "error" );
                    console.log( response );
                }
            });
            //alert( e.regid );
        }
        break;
        case 'message':
        	
        	var myLatlng = new google.maps.LatLng(-34.397, 150.644);
        	var marker = new google.maps.Marker({
        	    position: myLatlng,
        	    title:"Hello World!",
        	    icon: "aerogear_logo_200px.png"
        	});
        	
        	marker.setMap(map);
            // if this flag is set, this notification happened while we were in the foreground.
            // you might want to play a sound to get the user's attention, throw up a dialog, etc.
            if (e.foreground)
            {
                //$("#app-status-ul").append('<li>--INLINE NOTIFICATION--' + '</li>');
                // if the notification contains a soundname, play it.
                var my_media = new Media("/android_asset/www/"+e.soundname);
                my_media.play();
            }
            else
            {   // otherwise we were launched because the user touched a notification in the notification tray.
                if (e.coldstart) {
                    //Just alert what was sent
                    //$("#app-status-ul").append('<li>--COLDSTART NOTIFICATION--' + '</li>')
                } else {
                    //$("#app-status-ul").append('<li>--BACKGROUND NOTIFICATION--' + '</li>');
                }
            }
            
            //alert( e.payload.message );
            //$("#app-status-ul").append('<li>ME SSAGE -> MSG: ' + e.payload.message + '</li>');
            //$("#app-status-ul").append('<li>MESSAGE -> MSGCNT: ' + e.payload.msgcnt + '</li>');
        break;
        case 'error':
            //$("#app-status-ul").append('<li>ERROR -> MSG:' + e.msg + '</li>');
        break;
        default:
            //$("#app-status-ul").append('<li>EVENT -> Unknown, an event was received and we do not know what it is</li>');
        break;
    }
}
