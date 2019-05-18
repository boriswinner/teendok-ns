<template>
    <Page>
        <ActionBar title="teenDok"/>
        <WrapLayout backgroundColor="#3c495e">
          <RadCalendar 
            v-if="!isCreatingNewNote"
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
          <TimePicker v-if="isCreatingNewNote" class="home__time-picker" v-model="newNoteStartTime" />  
          <TextField v-model="newNoteText" class="home__new-note-text" @focus="isCreatingNewNote = true" hint="Создать новую заметку..." />
          <Button text="+" class="home__new-note-button" @tap="createNewNote"/>
        </WrapLayout>    
    </Page>
</template>

<script >
  import * as calendarModule from 'nativescript-ui-calendar';
  import * as frameModule from "tns-core-modules/ui/frame";
  import * as observableModule from "tns-core-modules/data/observable";

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
      // todayNotes (){
      //   let vi = this;
      //   let t = this.calendarEvents.filter(function (evt) {
      //     // adding + is a hack to compare dates, also we dont handle timezones
      //     return +vi.dateWithoutTime(evt.startDate) === +vi.dateWithoutTime()
      //   })
      //   console.log(t.length)        
      // }
      selectedDay() {
        return frameModule.topmost().getViewById("calendar").selectedDate
      },
      selectedDayNotes() {

      },
    },
    data () {
      return {
        // calendarEvents: [],
        newNoteText: null,
        newNoteStartTime: null,
        newNoteEndTime: null,
        isCreatingNewNote: false,
      }
    },
    methods: {
      dateWithoutTime (date){
        var d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;        
      },
      onDateSelected(args) {
        // console.log("onDateSelected: " + args.date);
        let vi = this;
        this.pushNote(args.date, "ccc")
        let t = this.calendarEvents.filter(function (evt) {
          // adding + is a hack to compare dates, also we dont handle timezones
          return +vi.dateWithoutTime(evt.startDate) === +vi.dateWithoutTime(args.date)
        })
        //console.log(t.length)
        let calendar = frameModule.topmost().getViewById("calendar");
        //console.log(calendar.getEventsForDate(args.date).length)
        console.log(this.selectedDay)
      },         
      createNewNote(){
        //console.log(this.newNoteText)
      },
      pushNote(tdate, tnote) {
        let t = {
          startDate: new Date(tdate.getFullYear(), tdate.getMonth(), tdate.getDate(), 1),
          endDate: new Date(tdate.getFullYear(), tdate.getMonth(), tdate.getDate(), 3),
          note: tnote
        }
        //console.log(t.startDate)
        let events = []
        let event = new calendarModule.CalendarEvent("event ", t.startDate, t.endDate, false);
        events.push(event)
        events.push(event)
        //this.$store.commit('addNote', event)
        // events.push(event)
        this.$store.state.notes = this.$store.state.notes.concat([event])
        // this.calendarEvents = this.calendarEvents.concat([event])
        console.log("notes")
        console.log(this.$store.state.notes)
      }
    },
    created() {
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
