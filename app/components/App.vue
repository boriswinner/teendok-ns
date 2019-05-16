<template>
    <Page>
        <ActionBar title="teenDok"/>
        <StackLayout backgroundColor="#3c495e">
          <RadCalendar class="home__calendar" id="calendar"
              @dateSelected="onDateSelected"
              :eventSource="calendarEvents"
              eventsViewMode="Inline" 
              selectionMode="Single" 
              viewMode="Month"              
          ></RadCalendar>      
          <Label text="engines" height="70" backgroundColor="#43b883"/>
          <Label text="second" height="70" backgroundColor="#289062"/>
          <Label text="third" height="70" backgroundColor="#1c6b48"/>
        </StackLayout>    
    </Page>
</template>

<script >
  import * as calendarModule from 'nativescript-ui-calendar';

  export default {
    data() {
      return {
        msg: 'Hello World!'
      }
    },
    computed: {
      calendarEvents (){
        return this.$store.state.notes
      }
    },
    data () {
      return {
        calEv: [],
      }
    },
    methods: {
      onDateSelected(args) {
        // console.log("onDateSelected: " + args.date);
        this.pushNote(args.date, "ccc")
      },         
      pushNote(tdate, tnote) {
        let t = {
          startDate: tdate,
          endDate: tdate,
          note: tnote
        }
        this.$store.commit('addNote', t)
        // console.log(this.$store.state.notes)
      }
    },
    created() {
    let events = [];
    let now = new Date();
    let startDate;
    let endDate;
    let event;
    for (let i = 1; i < 10; i++) {
      startDate = new Date(now.getFullYear(), now.getMonth(), i * 2, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), (i * 2), 3);
      event = new calendarModule.CalendarEvent("event " + i, startDate, endDate, false);
      events.push(event);
      if (i % 3 == 0) {
        event = new calendarModule.CalendarEvent("second " + i, startDate, endDate, true);
        events.push(event);
      }
    }
    this.$store.state.notes = events;
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
        height: 50%;
      }
    }
</style>
