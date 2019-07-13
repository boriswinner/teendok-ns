<template>
    <Page>
      <ScrollView>
        <WrapLayout backgroundColor="white">         
            <StackLayout verticalAlignment="center">
                <Label class="edit__time-picker-label" text="Начало:" />
            </StackLayout>          
            <DatePicker class="edit__date-picker" v-model="startDateForm" />
            <TimePicker class="edit__time-picker" @loaded="setTimePicker24h" v-model="startTimeForm" />

            <StackLayout verticalAlignment="center">
                <Label class="edit__time-picker-label" text="Конец:" />
            </StackLayout>          
            <DatePicker class="edit__time-picker" v-model="endDateForm" /> 
            <TimePicker class="edit__time-picker" @loaded="setTimePicker24h" v-model="endTimeForm" />              

          <TextField v-model="event.name" class="edit__new-note-text" hint="имя события..." />
          <TextField v-model="event.details" class="edit__new-note-text" hint="описание события..."/>
          <Button text="OK" class="edit__new-note-button" @tap="closeNote"/>                   
          <Button v-if="event" @tap="deleteNote" text="Удалить заметку" class="edit__delete-note-button"/>    
        </WrapLayout>
        </ScrollView>
    </Page>
</template>

<script>
import { isIOS, isAndroid } from "platform";
var application = require('application');  
import ServerCommunicationMixin from '@/components/ServerCommunicationMixin'

export default {
    mixins: [ServerCommunicationMixin],     
    name: 'NoteCreateEdit',
    props: {
      event: {
        type: Object,
        default () {
          return {
            id: null,
            startDate: new Date(),
            endDate: new Date(),
            name: "",
            details:"",
            status: null,
            location: null,
            timezone: null
          }
        }
      }
    },
    data (){
        return {
            startDateForm: new Date(),
            endDateForm: new Date(),
            startTimeForm: new Date(),
            endTimeForm: new Date()
        }
    }, 
    methods: {
      closeNote () { 
        this.event.startDate = new Date(
          this.startDateForm.getFullYear(),
          this.startDateForm.getMonth(),
          this.startDateForm.getDate(),
          this.startTimeForm.getHours(),
          this.startTimeForm.getMinutes(),
        )
        this.event.endDate = new Date(
          this.endDateForm.getFullYear(),
          this.endDateForm.getMonth(),
          this.endDateForm.getDate(),
          this.endTimeForm.getHours(),
          this.endTimeForm.getMinutes(),
        )
        if (+this.event.startDate > +this.event.endDate){
          alert('Событие должно заканчиваться позже, чем началось!')
        } else{
          this.$modal.close(this.event)      
        }
      },
      deleteNote () {
        this.$modal.close('delete')      
      },
      setTimePicker24h (event){
        // THIS WILL WORK ONLY ON ANDROID, BUT IT IS POSSIBLE TO ADOPT FOR IOS
        let picker = event.object.nativeView
        picker.setIs24HourView(java.lang.Boolean.TRUE)
      }      
    },
    mounted () {
      if (isAndroid) {
          application.android.on(application.AndroidApplication.activityBackPressedEvent, this.$modal.close);
      }
      for (var property in this.event) {
        console.log( property + ': ' + this.event[property]+'; ')
      }       
      this.startDateForm = this.event.startDate
      this.startTimeForm = this.event.startDate
      this.endDateForm = this.event.endDate
      this.endTimeForm = this.event.endDate                  
    }
}
</script>

<style scoped lang="scss">

    .edit {

      &__time-picker-label {
        width: 100%;
      }

      &__time-picker {
        height: 20%;
        width: 100%;
      }

      &__date-picker {
        height: 20%;
        width: 100%;
      }

      &__new-note-text {
        width: 75%;
        height: 10%;
      }

      &__new-note-button{
        width: 25%;
      }      

      &__delete-note-button {
          width: 100%;
          background-color: #ED0A51;
          color: white;
      }
    }
</style>
