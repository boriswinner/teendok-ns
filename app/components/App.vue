<template>
    <Page>
        <ActionBar title="teenDok">    
          <ActionItem @tap="openShareModal"
            android.systemIcon="ic_menu_share" android.position="actionBar" />              
            <ActionItem @tap="exportCalendar"
              android.systemIcon="ic_menu_save"
              text="export" android.position="actionBar" />            
            <ActionItem @tap="importCalendarFromFS"
              android.systemIcon="ic_menu_upload"
              text="import" android.position="actionBar" />                
            <ActionItem @tap="activatePermissionsFromLink"
              android.systemIcon="ic_partial_secure"
              text="import" android.position="actionBar" />  
            <ActionItem @tap="openPermissionsManage"
              android.systemIcon="ic_menu_preferences"
              text="import" android.position="actionBar" />                                            
        </ActionBar>
        <WrapLayout backgroundColor="white">
          <SegmentedBar class="home__calendar-mode-bar" @selectedIndexChange="changeCalendarMode">
            <SegmentedBarItem title="Месяц" />
            <SegmentedBarItem title="Неделя" />
            <SegmentedBarItem title="День" />
          </SegmentedBar>          
          <RadCalendar 
            v-show="calendarMode === 0"
            class="home__calendar" id="calendarMonth" ref="calendarMonth"
            @dateSelected="onDateSelected"
            @loaded="disableCalendarGestures"
            :eventSource="calendarEvents"
            eventsViewMode="None" 
            selectionMode="Single" 
            viewMode="Month"                        
          ></RadCalendar>  
          <RadCalendar 
            v-show="calendarMode === 1"
            class="home__calendar-week" id="calendarWeek" ref="calendarWeek"
            @loaded="disableCalendarGestures"
            @dateSelected="onDateSelected"
            :eventSource="calendarEvents"
            eventsViewMode="Inline" 
            selectionMode="Single" 
            viewMode="Week"              
          ></RadCalendar>     
          <ScrollView v-if="calendarMode === 1" orientation="vertical" class="home__week-wrapper"> 
            <StackLayout>     
              <GridLayout backgroundColor="white" columns="*, *, *, *, *, *, *, *" rows="60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60">
              <Label v-for = "(item, index) in ['00:00','01:00','02:00','03:00','04:00','05:00','06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00']" :key="index" :text="item" :row="index" col="0" backgroundColor="#ffd0c7"/>
              <Label v-for= "(item, index) in selectedWeekNotes" class="home__weekview_cell" :key="'event'+index" :col="item.column+1" :row="item.row" :text="item.title" backgroundColor="#dbc7ff" :style="{'margin-top': item.marginTop.toString(), 'margin-bottom': item.marginBottom.toString()}"/>                    
              </GridLayout>
            </StackLayout>
          </ScrollView>
          
          <RadCalendar 
            v-show="calendarMode === 2"
            class="home__calendar-day" id="calendarDay" ref="calendarDay"
            @loaded="disableCalendarGestures"
            @dateSelected="onDateSelected"
            :eventSource="calendarEvents"
            eventsViewMode="Inline" 
            selectionMode="Single" 
            viewMode="Day"      
            :dayViewStyle='dayViewStyle'       
          ></RadCalendar>                              
          <ScrollView v-show="calendarMode === 0" class="home__notes-list-wrapper">
            <ListView for="event in selectedDayFullEvents" class="home__notes-list" @itemTap="tapNote">
              <v-template>
                <WrapLayout class="home__notes-list-item">
                  <Label class="home__notes-list-item-note" :text="event.name" />
                  <Label class="home__notes-list-item-note" :text="event.details" />
                  <Label class="home__notes-list-item-time" :text="
                    ((+dateWithoutTime(event.startDate) != +dateWithoutTime(event.endDate)) ?
                    ('0'+event.startDate.getDate()).slice(-2) + '.' + ('0'+event.startDate.getMonth()).slice(-2) : '') + ' ' +
                    ('0'+event.startDate.getHours()).slice(-2)  + ':' + 
                    ('0'+event.startDate.getMinutes()).slice(-2) + ' - '" />
                  <Label class="home__notes-list-item-time" :text="
                    ((+dateWithoutTime(event.startDate) != +dateWithoutTime(event.endDate)) ?
                    ('0'+event.endDate.getDate()).slice(-2) + '.' + ('0'+event.endDate.getMonth()).slice(-2) : '') + ' ' +
                    ('0'+event.endDate.getHours()).slice(-2)  + ':' + 
                    ('0'+event.endDate.getMinutes()).slice(-2)" />
                </WrapLayout>
              </v-template>
            </ListView> 
          </ScrollView>            
          <button text="Создать заметку" class="home__new-note-text" 
            @tap="openNewNoteDialog"/>      
          <!-- this thing is for losing focus on textedit -->
        </WrapLayout>    
    </Page>
</template>

<script >
  import * as calendarModule from 'nativescript-ui-calendar';
  import * as frameModule from "tns-core-modules/ui/frame";
  import * as observableModule from "tns-core-modules/data/observable";
  import * as utils from "utils/utils";
  import { isIOS, isAndroid } from "platform";
  import * as frame from "ui/frame";
  import { type } from 'os';
  import NoteCreateEdit from '@/components/NoteCreateEdit'
  import SharePermissions from '@/components/SharePermissions'
  import ActivatePermissions from '@/components/ActivatePermissions'
  import ServerCommunicationMixin from '@/components/ServerCommunicationMixin'
  import { Color } from "tns-core-modules/color";
  import { error } from 'util';
  import HelpersMixin from './HelpersMixin';
  import ManagePermissions from './ManagePermissions.vue';

  var application = require('application');  

  export default {
    mixins: [ServerCommunicationMixin, HelpersMixin],    
    components: {
      NoteCreateEdit,
      SharePermissions,
      ActivatePermissions,
      ManagePermissions
    },
    computed: {
      calendarEvents (){
        return this.$store.getters.getCalendarEvents
      },
      fullEvents () {
        return this.$store.getters.getFullEvents
      },
      selectedDayFullEvents (){
        return this.fullEventsOfDay(this.selectedDay)
      },
      selectedWeekNotes (){
        //breaks events into different objects for every hour due to the grid
        let vi = this
        let ev = []
        this.sameWeekDates(this.selectedDay).forEach(function(item, index, arr){
          let t = vi.fullEventsOfDay(item)
          if (t.length >= 0){
            for (let i = 0; i < t.length; ++i){
              for (let j = t[i].startDate.getHours(); j <= t[i].endDate.getHours() ; ++j){
                ev.push ({
                  column: index,
                  row: j,
                  title: j ===  t[i].startDate.getHours() ? t[i].name : '',
                  marginTop: j === t[i].startDate.getHours() ? t[i].startDate.getMinutes() : 0,
                  marginBottom: j === t[i].endDate.getHours() ? t[i].endDate.getMinutes() : 0,
                })
              }
            }
          }
        })
        return ev
      },   
      dayViewStyle(){
        let t = new calendarModule.CalendarDayViewStyle()
        let dayEventsViewStyle = new calendarModule.DayEventsViewStyle();
        dayEventsViewStyle.timeLabelFormat = 'HH:mm';
        t.dayEventsViewStyle = dayEventsViewStyle;
        return t
      },   
    },
    data () {
      return {
        selectedDay: {
          type: Date,
        },
        calendarMode: {
          default: 0
        },
      }
    },
    methods: {
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
      fullEventsOfDay (day){
        return this.$store.getters.getFullEventsOfDay(day)
      },      
      changeCalendarMode(bar){
        this.calendarMode = bar.object.selectedIndex
      },
      onDateSelected(args) {
        this.selectedDay = args.date
      },         
      openNewNoteDialog() {
        let selectedDayWithCurrentTime = new Date(this.selectedDay.getTime())
        selectedDayWithCurrentTime.setHours(new Date().getHours(), new Date().getMinutes())
        this.$showModal(NoteCreateEdit, {
          props: {
            selectedDay: selectedDayWithCurrentTime
          },
          fullscreen: true
        }).then (data => {
            console.log('!!!!!!!!!')
            console.log(data)
            for (var property in data) {
              console.log( property + ': ' + data[property]+'; ')
            }                    
            if (!('eventName' in data)){
              console.log('NO EVENT NAME')
              this.pushNoteToServer(data.details,data.location,data.name,data.status,data.startDate, data.endDate, data.duration, data.rrule)
              // vi.$store.commit('editNoteByIdstr', t)             
            }
        }).catch( error => {
          console.log(error)
        })        
      },
      tapNote(event){
        let vi = this
        let i = event.item
        this.$showModal(NoteCreateEdit, {
          props: {
            event: i
          },
          fullscreen: true
        }).then (data => {
            if (data == 'delete'){
              this.deleteEventFromServer(i.id)
            }                        
            if (!('eventName' in data)){
              console.log('!!!!!!!!!')
              for (var property in data) {
                console.log( property + ': ' + data[property]+'; ')
              }  
              this.updateNoteOnServer(data.id, data.patternID, data.details,data.location,data.name,data.status,data.startDate, data.endDate, data.duration, data.rrule)          
              // vi.$store.commit('editNote', t)               
            }
        })
      },
      openShareModal(){
        this.$showModal(SharePermissions, {
          props: {
          }}).then (data => {})        
      },
      activatePermissionsFromLink() {
        this.$showModal(ActivatePermissions, {
          props: {
          }}).then (data => {})                
      },
      exportCalendar () {
        this.exportCalendarServer()
      },     
      openPermissionsManage() {
        this.$navigateTo(ManagePermissions, {
          props: {
          },
          }).then (data => {})         
      } 
    },
    created() {
      this.selectedDay = new Date();
      this.$store.commit('clearNotes') 
    },
    mounted: function () {
      // this.pushNote('det','loc','nam','sta',new Date(), new Date())
      this.getNotesFromServer()
    }    
  }
</script>

<style scoped lang="scss">
    ActionBar {
        background-color: #53ba82;
        color: #ffffff;
    }

    .message {
        vertical-align: center;
        text-align: center;
        font-size: 20;
        color: #333333;
    }

    .home {

      &__calendar-mode-bar{
        height: 10%;
        background-color: white;
        width: 100%;
      }

      &__calendar {
        width: 100%;
        height: 40%;
      }

      &__calendar-week {
        width: 87.5%;
        margin-left: 12.5%;
      }            

      &__calendar-day {
        width: 100%;
        height: 80%;
      }      

      &__time-picker-label {
        width: 40%;
      }

      &__time-picker {
        height: 20%;
        width: 60%;
      }

      &__new-note-text {
        height: 10%;
        width: 100%;
      }

      &__new-note-button{
        width: 10%;
      }

      &__notes-list-wrapper {
        height: 40%;
      }

      &__notes-list-item {
        background: white;
      }

      &__notes-list-item-note {
        font-size: 15px;
        width: 100%;
      }

      &__notes-list-item-time {
        font-size: 18px;
        font-weight: 600;
      }      

      &__week-wrapper {
        height: 50%;
      }

      &__weekview_cell {
        
      }
    }
</style>
