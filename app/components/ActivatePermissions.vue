<template>
    <Page>
      <ScrollView>
        <WrapLayout backgroundColor="white">
            <label textWrap="true" text="В этом меню вы можете активировать полученную ссылку доступа:"/>
            <button class="permission__button permission__button-share" @tap="activatePermissionsButtonTap" text="Вставить ссылку и получить права"/>
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
        activatePermissionsButtonTap () {
            this.pasteFromClipboard().then(res => {
                console.log(res)
                this.activatePermissions(res)
            })   
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
