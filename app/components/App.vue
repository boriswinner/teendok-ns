<template>
    <Page>
        <ActionBar title="teenDok">
          <NavigationButton v-show="isCreatingNewNote" text="Назад" android.systemIcon="ic_menu_back" @tap="createNewNoteRevertUIState" />          
        </ActionBar>
        <WrapLayout backgroundColor="#3c495e">
          <RadCalendar 
            v-show="!isCreatingNewNote"
            class="home__calendar" id="calendar" ref="calendar"
            @dateSelected="onDateSelected"
            :eventSource="calendarEvents"
            eventsViewMode="Inline" 
            selectionMode="Single" 
            viewMode="Month"              
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
          <ListView for="event in selectedDayNotes" class="home__notes-list">
            <v-template>
              <Label :text="event.title" />
            </v-template>
          </ListView>          
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

  export default {
    data() {
      return {
        msg: 'Hello World!'
      }
    },
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

      &__calendar {
        width: 100%;
        height: 40%;
      }

      &__time-picker-label {
        width: 40%;
      }

      &__time-picker {
        height: 20%;
        width: 60%;
      }

      &__new-note-text {
        width: 90%;
      }

      &__new-note-button{
        width: 10%;
      }
    }
</style>
