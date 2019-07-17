<template>
    <Page>
      <ScrollView>
        <WrapLayout backgroundColor="white">
            <label textWrap="true" text="Выберите права, которыми вы хотите поделиться:"/>
            <check-box v-for="(item,index) in Object.keys(actions)" :key="index+item"  :text="item"
              class="permission__checkbox" :checked="actionsForm[index] == true"  @checkedChange="actionsForm[index] = !actionsForm[index]; $forceUpdate(); "/>                     
            <button class="permission__button permission__button-share" @tap="sharePermissionsButtonTap" text="Поделиться"/>
            <label v-show="isShareButtonClicked" textWrap="true" text="Ссылка доступа: (нажмите на неё, чтобы скопировать)"/>
            <label v-show="isShareButtonClicked" textWrap="true" :text="permissionsShareUrl" @tap="copyToClipboard(permissionsShareUrl)"/>
        </WrapLayout>
        </ScrollView>
    </Page>
</template>

<script>
import { CheckBox } from 'nativescript-checkbox';
import { isIOS, isAndroid } from "platform";
var application = require('application');  
import ServerCommunicationMixin from '@/components/ServerCommunicationMixin'
import HelpersMixin from '@/components/HelpersMixin'
import * as Toast from 'nativescript-toast';

export default {
    mixins: [ServerCommunicationMixin, HelpersMixin],     
    name: 'SharePermissions',
    props: {
        event: null,
    },
    computed: {
    },
    data (){
        return {
            actions: {
              'Чтение': "READ",
              'Обновление' : "UPDATE",
              'Удаление' : "DELETE",
            }, 
            actionsForm: new Array(3).fill(false),
            permissionsShareUrl: '',
            isShareButtonClicked: false,
            isChecked: false      
        }
    }, 
    methods: {  
        sharePermissionsButtonTap () {
            this.isShareButtonClicked = true
            let permissions = []
            this.actionsForm.forEach((element, index) => {
                if (element == true){
                    permissions.push(Object.values(this.actions)[index])
                }
            });
            this.sharePermissions(permissions, this.event).then (data => {
                this.permissionsShareUrl = data
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
      &__checkbox {
          width: 100%;
      }
      &__button-share {
          background-color: aqua;
          width: 100%;
      }        
    }
</style>
