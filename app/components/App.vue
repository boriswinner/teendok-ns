<template>
    <Page>
        <ActionBar title="teenDok">        
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
              <Label v-for = "(item, index) in [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]" :key="index" :text="item" :row="index" col="0" backgroundColor="#ffd0c7"/>
              <Label v-for= "(item, index) in selectedWeekNotes" class="home__weekview_cell" :key="'event'+index" :col="item.column+1" :row="item.row" :text="item.title" backgroundColor="#dbc7ff" :style="{'margin-top': item.marginTop+'px', 'margin-bottom': item.marginBottom+'px'}"/>                    
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
                  <Label class="home__notes-list-item-time" :text="('0'+event.startDate.getHours()).slice(-2)  + ':' + ('0'+event.startDate.getMinutes()).slice(-2) + ' - '" />
                  <Label class="home__notes-list-item-time" :text="('0'+event.endDate.getHours()).slice(-2)+ ':' + ('0'+event.endDate.getMinutes()).slice(-2)" />
                </WrapLayout>
              </v-template>
            </ListView> 
          </ScrollView>            
          <TextField ref="newNoteField" v-model="newNoteText" :style="{ width: newNoteFieldWidth}" class="home__new-note-text" 
            @focus="openNewNoteDialog" @returnPress = "createNewNote" hint="Создать новую заметку..." />      
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
  import ServerCommunicationMixin from '@/components/ServerCommunicationMixin'

  var application = require('application');  

  export default {
    mixins: [ServerCommunicationMixin],    
    components: {
      NoteCreateEdit,
    },
    computed: {
      calendarEvents (){
        return this.$store.getters.getCalendarEvents
      },
      fullEvents () {
        return this.$store.getters.getFullEvents
      },
      selectedDayFullEvents (){
        let vi = this;
        let notes =  this.fullEvents.filter(function (evt) {
          // adding + is a hack to compare dates, also we dont handle timezones
          return +vi.dateWithoutTime(evt.startDate) === +vi.dateWithoutTime(vi.selectedDay)
        })
        notes.sort((a,b) => (a.startDate > b.startDate) ? 1 : ((b.startDate > a.startDate) ? -1 : 0))      
        return notes
      },
      selectedWeekNotes (){
        //breaks events into different objects for every hour due to the grid
        let vi = this
        let ev = []
        this.sameWeekDates(this.selectedDay).forEach(function(item, index, arr){
          let t = vi.getNotesOfDay(item)
          if (t.length >= 0){
            for (let i = 0; i < t.length; ++i){
              for (let j = t[i].startDate.getHours(); j <= t[i].endDate.getHours() ; ++j){
                ev.push ({
                  column: index,
                  row: j,
                  title: j ===  t[i].startDate.getHours() ? t[i].title : '',
                  marginTop: j === t[i].startDate.getHours() ? t[i].startDate.getMinutes() : 0,
                  marginBottom: j === t[i].endDate.getHours() ? t[i].endDate.getMinutes() : 0,
                })
              }
            }
          }
        })
        return ev
      },   
      newNoteFieldWidth () {
        if (this.isCreatingNewNote) {
          return '90%'
        } else {
          return '100%'
        }
      },
      dayViewStyle(){
        let t = new calendarModule.CalendarDayViewStyle()
        let dayEventsViewStyle = new calendarModule.DayEventsViewStyle();
        dayEventsViewStyle.timeLabelFormat = 'HH:mm';
        t.dayEventsViewStyle = dayEventsViewStyle;
        return t
      }   
    },
    data () {
      return {
        newNoteText: null,
        newNoteStartTime: {
          type: Date,
        },
        newNoteEndTime: {
          type: Date,
        },
        isCreatingNewNote: false,
        selectedDay: {
          type: Date,
        },
        calendarMode: {
          default: 0
        },
        tres: {
          default: null
        },
      }
    },
    methods: {
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
      getNotesOfDay(day) {
        let vi = this;
        let notes = this.calendarEvents.filter(function (evt) {
          // adding + is a hack to compare dates, also we dont handle timezones
          return +vi.dateWithoutTime(evt.startDate) === +vi.dateWithoutTime(day)
        })
        return notes
      },
      changeCalendarMode(bar){
        this.calendarMode = bar.object.selectedIndex
      },
      onDateSelected(args) {
        this.selectedDay = args.date
        // console.log(this.selectedWeekDays)
      },         
      openNewNoteDialog() {
        this.isCreatingNewNote = true; 
        this.$showModal(NoteCreateEdit)
          .then (data => {
            let t = data
            console.log('!!!!!!!!!')
            console.log(data)
            for (var property in t) {
              console.log( property + ': ' + t[property]+'; ')
            }            
            this.pushNoteToServer(data.details,data.location,data.name,data.status,data.startDate, data.endDate)
            // vi.$store.commit('editNoteByIdstr', t) 
        })        
      },
      tapNote(event){
        let vi = this
        let i = event.item
        this.$showModal(NoteCreateEdit, {
          props: {
            event: i
          }
        }).then (data => {
            let t = data
            console.log('!!!!!!!!!')
            for (var property in t) {
              console.log( property + ': ' + t[property]+'; ')
            }            
            vi.$store.commit('editNote', t) 
        })
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
    },
    created() {
      this.selectedDay = new Date();
      this.newNoteStartTime = new Date();
      this.newNoteEndTime = new Date();
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
