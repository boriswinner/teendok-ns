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
          <TextField ref="dummy" height="0" id="dummy"></TextField>
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
  import axios from "axios";
  var qs = require('qs');

  var application = require('application');  

  export default {
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
      firebaseToken () {
        return this.$store.getters.getFirebaseToken
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
        serverEvents: [],
        serverInstances: [],
        serverPatterns: [],        
        axiosAuthorized: null,
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
      createNewNoteRevertUIState(){
        //lose focus on main textEdit
        this.$refs.dummy.nativeView.focus()
        this.newNoteText = ""
        this.dismissSoftKeyboard()
      },
      createNewNote(){
        if (this.isCreatingNewNote){
          this.pushNote(this.selectedDay, this.newNoteStartTime, this.newNoteEndTime, this.newNoteText)
          this.createNewNoteRevertUIState()
        } else {
          console.log("ЕГГОГ")
        }
      },
      pushNote(details, location, name, status, started_at, ended_at) {
        let event = {
          details: details,
          location: location,
          name: name,
          status: status,
        }
        let pattern = {
          started_at: started_at,
          ended_at: ended_at
        }
        let vi = this
        let tempAxios = this.axiosAuthorized        
        tempAxios.post("http://planner.skillmasters.ga/api/v1/events", {
            details: details,
            location: location,
            name: name,
            status: status,            
        }).then(result => {
          console.log('post event')
          console.log(result.data)
          let eventID = result.data.data[0].id
          console.log(eventID)
          tempAxios.post("http://planner.skillmasters.ga/api/v1/patterns/?event_id="+eventID, {
            pattern: {
              started_at: started_at.getTime(),
              ended_at: ended_at.getTime(),              
            }
          }).then(result => {
            console.log('POST PATTERN SUCCESS')
            console.log(result.data)
            this.getNotesFromServer()
          }).catch(function (error) {
            console.log('post event error')
            console.log(error);
          })  
        }).catch(function (error) {
          console.log('post event error')
          console.log(error);
        })        
      
        // if (event.startDate > event.endDate){
        //   alert('Некорректное время!')
        // } else {
        //   this.$store.commit('addNote', event)          
        // }
      },
      getNotesFromServer () {
      let vi = this
      this.$store.commit('clearNotes') 
      let tempAxios = this.axiosAuthorized

      tempAxios.get("http://planner.skillmasters.ga/api/v1/events", {headers: {
        "X-Firebase-Auth": vi.firebaseToken
      }}).then(result => {
        console.log(result.data)
        if (!result.data.success) return
        vi.serverEvents = result.data.data
        vi.serverEvents = vi.serverEvents.reduce(function(map, obj) {
            map[obj.id] = obj;
            return map;
        }, {});        
        // console.log(this.serverEvents)
        let event_ids = result.data.data.map(a => parseInt(a.id))   
        // console.log(event_ids)
        return tempAxios.get("http://planner.skillmasters.ga/api/v1/events/instances", {
          headers: {
            "X-Firebase-Auth": vi.firebaseToken
          },
          params: {
            "id": event_ids,
          },              
        }).then(result => {
          console.log(result.data)
            if (!result.data.success) return
            vi.serverInstances = result.data.data
            return tempAxios.get("http://planner.skillmasters.ga/api/v1/patterns", {
              headers: {
                "X-Firebase-Auth": vi.firebaseToken
              },
              params: {
                "events": event_ids,
              },                       
            }).then(result => {
              console.log(result.data)
              if (!result.data.success) return
              vi.serverPatterns = result.data.data  
              vi.serverPatterns = vi.serverPatterns.reduce(function(map, obj) {
                  map[obj.event_id] = obj;
                  return map;
              }, {});                              
            }).catch(function (error) {
            console.log(error);
            }).finally(function () {
              console.log('------')
              console.log(vi.serverInstances.length)
              vi.serverInstances.forEach(function (i, index) {
                // console.log(i)
                // console.log(i.event_id)
                // console.log(vi.serverEvents)
                let t = {
                  id: i.event_id,
                  startDate: new Date(i.started_at),
                  endDate: new Date(i.ended_at),
                  name: vi.serverEvents[i.event_id].name,
                  details: vi.serverEvents[i.event_id].details,
                  status: vi.serverEvents[i.event_id].status,
                  location: vi.serverEvents[i.event_id].location,
                  timezone: vi.serverPatterns[i.event_id].timezone
                }
                console.log(t)
                vi.$store.commit('addNote', t) 
              })
            });                       
        }).catch(function (error) {
        console.log(error);
        })            
      }).catch(function (error) {
        console.log(error);
      })
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
            this.pushNote(data.details,data.location,data.name,data.status,data.startDate, data.endDate)
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
      backEvent(args) {
        // THIS WILL WORK ONLY ON ANDROID, BUT IT IS POSSIBLE TO ADOPT FOR IOS
        if (this.isCreatingNewNote){
          args.cancel = true;
          this.createNewNoteRevertUIState()
        }
      }
    },
    created() {
      this.selectedDay = new Date();
      this.newNoteStartTime = new Date();
      this.newNoteEndTime = new Date();
      let vi = this
      this.axiosAuthorized = axios.create({
          paramsSerializer: params => qs.stringify(params, {arrayFormat: 'repeat'}),
          headers: {"X-Firebase-Auth": vi.firebaseToken}
      });    
      //debug only
      // this.axiosAuthorized.interceptors.request.use(request => {
      //   console.log('Starting Request', request)
      //   return request
      // })       
    },
    mounted: function () {
      //bind back button
      if (isAndroid) {
          application.android.on(application.AndroidApplication.activityBackPressedEvent, this.backEvent);
      }      
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
