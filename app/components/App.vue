<template>
    <Page>
        <ActionBar title="teenDok"/>
        <StackLayout backgroundColor="#3c495e">
          <RadCalendar class="home__calendar"
              @dateSelected="onDateSelected"
          ></RadCalendar>      
          <Label text="engines" height="70" backgroundColor="#43b883"/>
          <Label text="second" height="70" backgroundColor="#289062"/>
          <Label text="third" height="70" backgroundColor="#1c6b48"/>
        </StackLayout>    
    </Page>
</template>

<script >
  export default {
    data() {
      return {
        msg: 'Hello World!'
      }
    },
    methods: {
      onDateSelected(args) {
        console.log("onDateSelected: " + args.date);
        this.pushNote(args.date, "aaa")
      },         
      pushNote(tdate, tnote) {
        let t = {
          date: tdate,
          note: tnote
        }
        this.$store.commit('addNote', t)
        console.log(this.$store.state.notes)
      }
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
