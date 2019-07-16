<template>
    <Page>
      <ScrollView>
        <WrapLayout backgroundColor="white">
            <label textWrap="true" text="В этом меню вы можете активировать полученную ссылку доступа:"/>
            <button class="permission__button permission__button-share" @tap="activatePermissionsTokenButtonTap" text="Вставить токен и получить права"/>
            <button class="permission__button permission__button-share" @tap="activatePermissionsUrlButtonTap" text="Вставить ссылку и получить права"/>
        </WrapLayout>
        </ScrollView>
    </Page>
</template>

<script>
import { isIOS, isAndroid } from "platform";
var application = require('application');  
import ServerCommunicationMixin from '@/components/ServerCommunicationMixin'
var clipboard = require("nativescript-clipboard");
import * as Toast from 'nativescript-toast';
import HelpersMixin from './HelpersMixin';

export default {
    mixins: [ServerCommunicationMixin, HelpersMixin],     
    name: 'ActivatePermissions',
    props: {
    },
    computed: {
    },
    data (){
        return {
        }
    }, 
    methods: {  
        activatePermissionsTokenButtonTap () {
            console.log(this.APIurl)
            let vi = this
            this.pasteFromClipboard().then(res => {
                console.log(res)
                this.activatePermissions(vi.APIurl+'share/'+res)
            }).catch((err) => {
            console.log(err);
            });   
        },        
        activatePermissionsUrlButtonTap () {
            this.pasteFromClipboard().then(res => {
                console.log(res)
                this.activatePermissions(res)
            }).catch((err) => {
            console.log(err);
            });  
        },
    },
    mounted () {
      if (isAndroid) {
          application.android.on(application.AndroidApplication.activityBackPressedEvent, this.$modal.close);
      }       
    }
}
</script>

<style scoped lang="scss">

    .permission {
      &__button {
          width: 100%;
      }
      &__button-active {
        background-color: aqua
      }
      &__button-share {
          background-color: blueviolet
      }        
    }
</style>
