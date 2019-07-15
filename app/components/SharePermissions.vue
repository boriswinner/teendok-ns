<template>
    <Page>
      <ScrollView>
        <WrapLayout backgroundColor="white">
            <label text="Выберите права, которыми вы хотите поделиться:"/>
            <button v-for="(item,index) in Object.keys(actions)"  class="permission__button"
                    :class="{'permission__button-active' : actionsForm[index] == true}" :key="index+item" @tap="actionsForm[index] = !actionsForm[index]; $forceUpdate();" :text="item"/>                     
            <button class="permission__button permission__button-share" @tap="sharePermissionsButtonTap" text="Поделиться"/>
            <label text="Здесь будет токен"/>
        </WrapLayout>
        </ScrollView>
    </Page>
</template>

<script>
import { isIOS, isAndroid } from "platform";
var application = require('application');  
import ServerCommunicationMixin from '@/components/ServerCommunicationMixin'

export default {
    mixins: [ServerCommunicationMixin],     
    name: 'SharePermissions',
    props: {
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
            actionsForm: new Array(3).fill(false)           
        }
    }, 
    methods: {  
        sharePermissionsButtonTap () {
            this.sharePermissions(null ,null, null)
        }    
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
