<template>
    <Page>
        <ActionBar title="Настройки прав..."/>     
      <GridLayout columns="*" rows="*,10*">
        <SegmentedBar row="0" col="0" @selectedIndexChange="mode = !mode" class="managepermissions_mode-bar">
            <SegmentedBarItem title="Я раздал" />
            <SegmentedBarItem title="Мне раздали" />
        </SegmentedBar>  

        <ScrollView row="1" col="0" v-show="mode" class="managepermissions_list-wrapper">
            <ListView class="managepermissions_list-wrapper" for="event in minePermissions">
                <v-template>
                <GridLayout columns="2*,*" rows="*,*,*" class="managepermissions__list-item">
                    <Label row="0" col="0" class="managepermissions__list-item-note" :text="event.name" />
                    <Label row="1" col="0" class="managepermissions__list-item-desc" :text="event.details" />
                    <Label row="1" col="0" class="managepermissions__list-item-desc" :text="event.user" />
                    <Label row="2" col="0" class="managepermissions__list-item-desc" :text="event.permissionName" />
                    <button row="0" rowSpan="3" col="1" text="Удалить" @tap="revokePermissionWrapper(event.id)"/>
                </GridLayout>
                </v-template>
            </ListView> 
        </ScrollView>    

        <ScrollView row="1" col="0" v-show="!mode" class="managepermissions_list-wrapper">
            <ListView class="managepermissions_list-wrapper" for="event in notMinePermissions">
                <v-template>
                <GridLayout columns="2*,*" rows="*,*,*" class="managepermissions__list-item">
                    <Label row="0" col="0" class="managepermissions__list-item-note" :text="event.name" />
                    <Label row="1" col="0" class="managepermissions__list-item-desc" :text="event.details" />
                    <Label row="1" col="0" class="managepermissions__list-item-desc" :text="event.user" />
                    <Label row="2" col="0" class="managepermissions__list-item-desc" :text="event.permissionName" />
                    <button row="0" rowSpan="3" col="1" text="Удалить" @tap="revokePermissionWrapper(event.id)"/>
                </GridLayout>
                </v-template>
            </ListView> 
        </ScrollView>         
      </GridLayout>                           
    </Page>
</template>

<script>
import { isIOS, isAndroid } from "platform";
var application = require('application');  
import ServerCommunicationMixin from '@/components/ServerCommunicationMixin'
var clipboard = require("nativescript-clipboard");
import * as Toast from 'nativescript-toast';
import HelpersMixin from './HelpersMixin';
import { error } from 'util';

export default {
    mixins: [ServerCommunicationMixin, HelpersMixin],     
    name: 'ActivatePermissions',
    props: {
    },
    computed: {
      fullEvents () {
        return this.$store.getters.getFullEvents
      },        
    },
    data (){
        return {
            minePermissions: [],
            notMinePermissions: [],
            permissionsNames: {
                'READ_EVENT': 'Чтение',
                'UPDATE_EVENT': 'Изменение',
                'DELETE_EVENT': 'Удаление'
            },
            mode: false
        }
    }, 
    methods: { 
        revokePermissionWrapper (event_id){
            this.revokePermission(event_id).then(result => {
                this.minePermissions = []
                this.notMinePermissions = []
                this.getPermissionsWrapper()
            })
        } ,
        getPermissionsWrapper(){
            let vi = this
            this.getPermissions(true).then( res => {
                console.log(res)
                res.forEach(permission => {
                    let event_id = permission.entity_id
                    let event = this.fullEvents.find((element,index) => {
                        return element.id == event_id
                    })                    
                    vi.getUserById(permission.user_id).then(res => {
                        let t = {
                            id: permission.id,
                            name: event ? event.name : "Весь календарь",
                            details: event ? event.details : "",
                            user: "Пользователь: "+res.username,
                            permissionName: vi.permissionsNames[permission.name]
                        }
                        this.minePermissions.push(t)
                    })
                });
                this.$forceUpdate();
            }).catch(error => {
                console.log(error)
            })

            this.getPermissions(false).then( res => {
                console.log(res)
                res.forEach(permission => {
                    let event_id = permission.entity_id
                    let event = this.fullEvents.find((element,index) => {
                        return element.id == event_id
                    })
                    vi.getUserById(permission.owner_id).then(res => {
                        let t = {
                            id: permission.id,
                            name: (event ? event.name : (isNaN(permission.entity_id) ? 'Весь календарь': 'Недоступное для чтения событие')),
                            details: (event ? event.details : ''),
                            user: "Пользователь: "+res.username,
                            permissionName: vi.permissionsNames[permission.name]
                        }
                        this.notMinePermissions.push(t)
                    })
                });
                this.$forceUpdate();
            }).catch(error => {
                console.log(error)
            }) 
        }
    },
    mounted () {
      if (isAndroid) {
          application.android.on(application.AndroidApplication.activityBackPressedEvent, this.$modal.close);
      }         
      this.getPermissionsWrapper()  
    }
}
</script>

<style scoped lang="scss">
  .managepermissions {
      &__mode-bar{
        height: 10%;
        background-color: white;
        width: 100%;
      }      
      &__list-wrapper{
          height: 90%;
      }
      &__list-item{
          width: 100%;
          height: 20%;
      }
      &__list-item-note {
        font-size: 18px;
        font-weight: 600;          
        width: 100%;
      }

      &__list-item-desc {
        font-size: 15px;
        width: 100%;
      }           
  }
</style>
