const utilsModule = require("tns-core-modules/utils/utils");
var clipboard = require("nativescript-clipboard");
import * as Toast from 'nativescript-toast';

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
    }
}