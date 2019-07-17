const utilsModule = require("tns-core-modules/utils/utils");
var clipboard = require("nativescript-clipboard");
import * as Toast from 'nativescript-toast';
import * as calendarModule from 'nativescript-ui-calendar';
import * as frameModule from "tns-core-modules/ui/frame";
import * as observableModule from "tns-core-modules/data/observable";
import * as utils from "utils/utils";
import { isIOS, isAndroid } from "platform";
import * as frame from "ui/frame";
import { type } from 'os';
import { Color } from "tns-core-modules/color";
import { error } from 'util';

export default {
    data () {
       return {
       }
    },
    computed: {
        APIurl () {
            return this.$store.getters.getAPIurl
        }
    },
    methods: {
        copyToClipboard(text){
            clipboard.setText(text).then(function() {
                var toast = Toast.makeText("Скопировано!");
                toast.show();
            }).catch (error => {
                console.log(error)
            })            
        },
        pasteFromClipboard(){
            return clipboard.getText().then(function(content) {
                return content
            })            
        },
        openLink (url) {
            utilsModule.openUrl(url)
        }, 
        dismissSoftKeyboard(){
            if (isIOS) {
                frame.topmost().nativeView.endEditing(true);
            }
            if (isAndroid) {
                utils.ad.dismissSoftInput();
            }    
        },  
        dateWithoutTime (date){
            var d = new Date(date);
            d.setHours(0, 0, 0, 0);
            return d;        
        },                   
        disableCalendarGestures (event){
            // THIS WILL WORK ONLY ON ANDROID, BUT IT IS POSSIBLE TO ADOPT FOR IOS
            let calendar = event.object
            let telCalendar = calendar.nativeView
            let gestureManager = telCalendar.getGestureManager()
            gestureManager.setSwipeUpToChangeDisplayMode(false)
            gestureManager.setPinchCloseToChangeDisplayMode(false)
            gestureManager.setSwipeDownToChangeDisplayMode(false)
            gestureManager.setDoubleTapToChangeDisplayMode(false)
        },
        setTimePicker24h (event){
            // THIS WILL WORK ONLY ON ANDROID, BUT IT IS POSSIBLE TO ADOPT FOR IOS
            let picker = event.object.nativeView
            picker.setIs24HourView(java.lang.Boolean.TRUE)
        },    
        getKeyByValue(object, value) {
            return Object.keys(object).find(key => object[key] === value);
        },                  
        sameWeekDates(current) {
            var week= new Array(); 
            let t = new Date(current);
            let day = current.getDay()
            if (day == 0){
              day = 7
            }
            day--
            t.setDate((current.getDate() - day));
            for (var i = 0; i < 7; i++) {
                week.push(
                    new Date(t)
                ); 
                t.setDate(t.getDate() +1);
            }
            return week;        
        },        
    }
}