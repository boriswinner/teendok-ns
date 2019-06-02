<template>
    <Page>
        <ActionBar title="teenDok">
          <NavigationButton v-show="isCreatingNewNote" text="Назад" android.systemIcon="ic_menu_back" @tap="createNewNoteRevertUIState" />          
        </ActionBar>
        <WrapLayout backgroundColor="#3c495e">
          <SegmentedBar class="home__calendar-mode-bar" @selectedIndexChange="changeCalendarMode">
            <SegmentedBarItem title="Месяц" />
            <SegmentedBarItem title="Неделя" />
            <SegmentedBarItem title="День" />
          </SegmentedBar>          
          <RadCalendar 
            v-show="!isCreatingNewNote && calendarMode === 0"
            class="home__calendar" id="calendarMonth" ref="calendarMonth"
            @dateSelected="onDateSelected"
            :eventSource="calendarEvents"
            eventsViewMode="None" 
            selectionMode="Single" 
            viewMode="Month"              
          ></RadCalendar>  
          <RadCalendar 
            v-show="!isCreatingNewNote && calendarMode === 1"
            class="home__calendar-week" id="calendarWeek" ref="calendarWeek"
            @dateSelected="onDateSelected"
            :eventSource="calendarEvents"
            eventsViewMode="Inline" 
            selectionMode="Single" 
            viewMode="Week"              
          ></RadCalendar> 
          <RadCalendar 
            v-show="!isCreatingNewNote && calendarMode === 2"
            class="home__calendar-day" id="calendarDay" ref="calendarDay"
            @dateSelected="onDateSelected"
            :eventSource="calendarEvents"
            eventsViewMode="Inline" 
            selectionMode="Single" 
            viewMode="Day"              
          ></RadCalendar>                        
          <StackLayout verticalAlignment="center">
            <Label v-if="isCreatingNewNote" class="home__time-picker-label" text="Время начала" />
          </StackLayout>          
          <TimePicker v-if="isCreatingNewNote" class="home__time-picker" v-model="newNoteStartTime" />
          <StackLayout verticalAlignment="center">
            <Label v-if="isCreatingNewNote" class="home__time-picker-label" text="Время конца" />
          </StackLayout>     
          <TimePicker v-if="isCreatingNewNote" class="home__time-picker" v-model="newNoteEndTime" />  
          <TextField ref="newNoteField" v-model="newNoteText" class="home__new-note-text" 
            @focus="isCreatingNewNote = true" @returnPress = "createNewNote" hint="Создать новую заметку..." />
          <Button text="+" class="home__new-note-button" @tap="createNewNote"/>
          <ScrollView v-show="calendarMode === 0 && !isCreatingNewNote" class="home__notes-list-wrapper">
            <ListView for="event in selectedDayNotes" class="home__notes-list" @itemTap="tapNote">
              <v-template>
                <WrapLayout class="home__notes-list-item">
                  <Label class="home__notes-list-item-note" :text="event.title" />
                  <Label class="home__notes-list-item-time" :text="event.startDate.getHours() + ':' + event.startDate.getMinutes() + ' - '" />
                  <Label class="home__notes-list-item-time" :text="event.endDate.getHours() + ':' + event.endDate.getMinutes()" />
                </WrapLayout>
              </v-template>
            </ListView> 
          </ScrollView>         
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

  export default {
    computed: {
      calendarEvents (){
        return this.$store.state.notes
      },
      selectedDayNotes (){
        let vi = this;
        return this.calendarEvents.filter(function (evt) {
          // adding + is a hack to compare dates, also we dont handle timezones
          return +vi.dateWithoutTime(evt.startDate) === +vi.dateWithoutTime(vi.selectedDay)
        })
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
      changeCalendarMode(bar){
        this.calendarMode = bar.object.selectedIndex
        console.log(this.calendarMode)
        console.log(typeof this.calendarMode)
        console.log((!this.isCreatingNewNote) && (this.calendarMode == 0))
      },
      onDateSelected(args) {
        this.selectedDay = args.date
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
        let event = new calendarModule.CalendarEvent(t.noteText, t.startDate, t.endDate, false);
        this.$store.state.notes = this.$store.state.notes.concat([event])
        console.log("notes")
        console.log(this.$store.state.notes)
      },
      tapNote(event){
        console.log(event.item.title)
      },
      disableCalendarGestures(event){
        console.log('disable')
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
        width: 100%;
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
        width: 90%;
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
    }
</style>
