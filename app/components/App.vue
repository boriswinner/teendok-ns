<template>
    <Page>
        <ActionBar title="teenDok">
          <NavigationButton v-show="isCreatingNewNote" text="Назад" android.systemIcon="ic_menu_back" @tap="createNewNoteRevertUIState" />          
        </ActionBar>
        <WrapLayout backgroundColor="white">
          <SegmentedBar v-show="!isCreatingNewNote" class="home__calendar-mode-bar" @selectedIndexChange="changeCalendarMode">
            <SegmentedBarItem title="Месяц" />
            <SegmentedBarItem title="Неделя" />
            <SegmentedBarItem title="День" />
          </SegmentedBar>          
          <RadCalendar 
            v-show="!isCreatingNewNote && calendarMode === 0"
            class="home__calendar" id="calendarMonth" ref="calendarMonth"
            @dateSelected="onDateSelected"
            @loaded="disableCalendarGestures"
            :eventSource="calendarEvents"
            eventsViewMode="None" 
            selectionMode="Single" 
            viewMode="Month"              
          ></RadCalendar>  
          <RadCalendar 
            v-show="!isCreatingNewNote && calendarMode === 1"
            class="home__calendar-week" id="calendarWeek" ref="calendarWeek"
            @loaded="disableCalendarGestures"
            @dateSelected="onDateSelected"
            :eventSource="calendarEvents"
            eventsViewMode="Inline" 
            selectionMode="Single" 
            viewMode="Week"              
          ></RadCalendar>     
          <ScrollView v-if="!isCreatingNewNote && calendarMode === 1" orientation="vertical" class="home__week-wrapper"> 
            <StackLayout>     
              <GridLayout backgroundColor="white" columns="*, *, *, *, *, *, *, *" rows="60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60">
              <Label v-for = "(item, index) in [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]" :key="index" :text="item" :row="index" col="0" backgroundColor="#ffd0c7"/>
              <Label v-for= "(item, index) in selectedWeekNotes" class="home__weekview_cell" :key="'event'+index" :col="item.column+1" :row="item.row" :text="item.title" backgroundColor="#dbc7ff" :style="'margin-top: '+item.marginTop+'px;'"/>                    
              </GridLayout>
            </StackLayout>
          </ScrollView>
          
          <RadCalendar 
            v-show="!isCreatingNewNote && calendarMode === 2"
            class="home__calendar-day" id="calendarDay" ref="calendarDay"
            @loaded="disableCalendarGestures"
            @dateSelected="onDateSelected"
            :eventSource="calendarEvents"
            eventsViewMode="Inline" 
            selectionMode="Single" 
            viewMode="Day"      
            :dayViewStyle='dayViewStyle'        
          ></RadCalendar>                        
          <StackLayout verticalAlignment="center">
            <Label v-if="isCreatingNewNote" class="home__time-picker-label" text="Время начала" />
          </StackLayout>          
          <TimePicker v-if="isCreatingNewNote" class="home__time-picker" v-model="newNoteStartTime" />
          <StackLayout verticalAlignment="center">
            <Label v-if="isCreatingNewNote" class="home__time-picker-label" text="Время конца" />
          </StackLayout>     
          <TimePicker v-if="isCreatingNewNote" class="home__time-picker" v-model="newNoteEndTime" />  
          <ScrollView v-show="calendarMode === 0 && !isCreatingNewNote" class="home__notes-list-wrapper">
            <ListView for="event in selectedDayNotes" class="home__notes-list" @itemTap="tapNote">
              <v-template>
                <WrapLayout class="home__notes-list-item">
                  <Label class="home__notes-list-item-note" :text="event.title" />
                  <Label class="home__notes-list-item-time" :text="('0'+event.startDate.getHours()).slice(-2)  + ':' + ('0'+event.startDate.getMinutes()).slice(-2) + ' - '" />
                  <Label class="home__notes-list-item-time" :text="('0'+event.endDate.getHours()).slice(-2)+ ':' + ('0'+event.endDate.getMinutes()).slice(-2)" />
                </WrapLayout>
              </v-template>
            </ListView> 
          </ScrollView>            
          <TextField ref="newNoteField" v-model="newNoteText" :style="{ width: newNoteFieldWidth}" class="home__new-note-text" 
            @focus="isCreatingNewNote = true" @returnPress = "createNewNote" hint="Создать новую заметку..." />
          <Button v-show="isCreatingNewNote" text="+" class="home__new-note-button" @tap="createNewNote"/>       
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
  import NoteEdit from '@/components/NoteEdit'


  export default {
    components: {
      NoteEdit,
    },
    computed: {
      calendarEvents (){
        return this.$store.getters.getNotes
      },
      selectedDayNotes (){
        let vi = this;
        let notes =  this.calendarEvents.filter(function (evt) {
          // adding + is a hack to compare dates, also we dont handle timezones
          return +vi.dateWithoutTime(evt.startDate) === +vi.dateWithoutTime(vi.selectedDay)
        })
        notes.sort((a,b) => (a.startDate > b.startDate) ? 1 : ((b.startDate > a.startDate) ? -1 : 0))      
        return notes
      },
      selectedWeekNotes (){
        let vi = this
        let ev = []
        this.sameWeekDates(this.selectedDay).forEach(function(item, index, arr){
          let t = vi.getNotesOfDay(item)
          if (t.length >= 0){
            for (let i = 0; i < t.length; ++i){
              ev.push ({
                column: index,
                row: t[i].startDate.getHours(),
                title: t[i].title,
                marginTop: t[i].startDate.getMinutes(),
              })
            }
          }
        })
        console.log('------------')
        console.log(ev)
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
        }        
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
        this.isCreatingNewNote = false
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
      pushNote(tDate, tStartTime, tEndTime, tNoteText) {
        let t = {
          startDate: new Date(tDate.getFullYear(), tDate.getMonth(), tDate.getDate(), tStartTime.getHours(), tStartTime.getMinutes()),
          endDate: new Date(tDate.getFullYear(), tDate.getMonth(), tDate.getDate(), tEndTime.getHours(), tEndTime.getMinutes()),
          noteText: tNoteText
        }
        if (t.startDate > t.endDate){
          alert('Некорректное время!')
        } else {
          this.$store.commit('addNote', t)          
        }
      },
      tapNote(event){
        this.$showModal(NoteEdit, {
          props: {
            noteObject: event.item
          }
        })
        console.log(event.item.title)
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
      }
    },
    created() {
      this.selectedDay = new Date();
      this.newNoteStartTime = new Date();
      this.newNoteEndTime = new Date();
      // let events = [];
      // let now = new Date();
      // let startDate;
      // let endDate;
      // let event;
      // for (let i = 1; i < 2; i++) {
      //   startDate = new Date(now.getFullYear(), now.getMonth(), i * 2, 1);
      //   console.log(startDate)
      //   endDate = new Date(now.getFullYear(), now.getMonth(), (i * 2), 3);
      //   event = new calendarModule.CalendarEvent("event " + i, startDate, endDate, false);
      //   events.push(event);
      //   if (i % 3 == 0) {
      //     event = new calendarModule.CalendarEvent("second " + i, startDate, endDate, true);
      //     events.push(event);
      //   }
      // }
      // this.$store.state.notes = events;
      // console.log(this.$store.state.notes)
    },
    mounted: function () {
      this.$nextTick(function () {
        // let calendar = this.$refs.calendarMonth._nativeView;
        // calendar.createNativeView()
        // calendar = calendar._nativeView
        // // let t = calendar.nativeViewProtected
        // console.log('---')
        // for (let property in calendar) {
        //   console.log( property + ': ' + calendar[property]+'; ');
        // }        
        // console.log(calendar)        
        // console.log('---')
        // console.log(t)
        // console.log('---')
        // gestureManager.setDoubleTapToChangeDisplayMode(false); // true is the default value
        
      })
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
